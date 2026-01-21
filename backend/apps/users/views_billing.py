"""
Vues API pour la facturation (Factures et Paiements)
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models

from .models import Invoice, Payment
from .serializers import (
    InvoiceSerializer,
    InvoiceCreateSerializer,
    InvoiceUpdateSerializer,
    PaymentSerializer,
    PaymentCreateSerializer
)
from .permissions import IsStaffOrAdmin


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les factures
    
    Endpoints:
    - GET /api/v1/billing/invoices/ - Liste des factures
    - GET /api/v1/billing/invoices/{id}/ - Détails d'une facture
    - POST /api/v1/billing/invoices/ - Créer une facture
    - PATCH /api/v1/billing/invoices/{id}/ - Modifier une facture
    - GET /api/v1/billing/invoices/by-record/{record_id}/ - Factures d'un dossier
    """
    
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InvoiceUpdateSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        """Filtrer les factures selon les paramètres"""
        queryset = Invoice.objects.select_related(
            'medical_record', 'medical_record__patient', 'created_by'
        ).prefetch_related('payments').all()
        
        # Filtrer par statut
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrer par dossier médical
        record_id = self.request.query_params.get('record', None)
        if record_id:
            queryset = queryset.filter(medical_record_id=record_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Le created_by est défini automatiquement"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """
        Récupère tous les paiements liés à une facture
        """
        invoice = self.get_object()
        payments = invoice.payments.select_related('created_by').order_by('-payment_date')
        
        serializer = PaymentSerializer(payments, many=True)
        return Response({
            'invoice': str(invoice.invoice_number),
            'total_amount': str(invoice.amount),
            'total_paid': str(invoice.payments.filter(status='completed').aggregate(
                total=models.Sum('amount')
            )['total'] or 0),
            'balance_due': str(invoice.amount - (invoice.payments.filter(status='completed').aggregate(
                total=models.Sum('amount')
            )['total'] or 0)),
            'payments': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_issued(self, request, pk=None):
        """
        Marquer une facture comme émise
        """
        invoice = self.get_object()
        
        if invoice.status != 'draft':
            return Response({
                'error': 'Seules les factures en brouillon peuvent être émises.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'issued'
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response({
            'success': True,
            'message': 'Facture émise avec succès.',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """
        Marquer une facture comme payée
        """
        invoice = self.get_object()
        
        if invoice.status == 'paid':
            return Response({
                'error': 'Cette facture est déjà payée.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'paid'
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response({
            'success': True,
            'message': 'Facture marquée comme payée.',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Annuler une facture
        """
        invoice = self.get_object()
        
        if invoice.status == 'paid':
            return Response({
                'error': 'Impossible d\'annuler une facture déjà payée.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'cancelled'
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response({
            'success': True,
            'message': 'Facture annulée avec succès.',
            'data': serializer.data
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les paiements
    
    Endpoints:
    - GET /api/v1/billing/payments/ - Liste des paiements
    - GET /api/v1/billing/payments/{id}/ - Détails d'un paiement
    - POST /api/v1/billing/payments/ - Créer un paiement
    - GET /api/v1/billing/payments/by-invoice/{invoice_id}/ - Paiements d'une facture
    """
    
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """Filtrer les paiements selon les paramètres"""
        queryset = Payment.objects.select_related(
            'invoice', 'invoice__medical_record', 'created_by'
        ).all()
        
        # Filtrer par statut
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrer par méthode de paiement
        method_filter = self.request.query_params.get('method', None)
        if method_filter:
            queryset = queryset.filter(payment_method=method_filter)
        
        return queryset.order_by('-payment_date')
    
    def perform_create(self, serializer):
        """Le created_by est défini automatiquement"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='by-invoice/(?P<invoice_id>[^/.]+)')
    def by_invoice(self, request, invoice_id=None):
        """
        Récupère tous les paiements d'une facture
        """
        invoice = get_object_or_404(Invoice, id=invoice_id)
        payments = Payment.objects.filter(
            invoice=invoice
        ).select_related('created_by').order_by('-payment_date')
        
        serializer = self.get_serializer(payments, many=True)
        
        total_paid = invoice.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        return Response({
            'invoice': str(invoice.invoice_number),
            'total_amount': str(invoice.amount),
            'total_paid': str(total_paid),
            'balance_due': str(invoice.amount - total_paid),
            'payments': serializer.data,
            'total': payments.count()
        })
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Valider un paiement (le marquer comme complété)
        """
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response({
                'error': 'Ce paiement n\'est plus en attente.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'completed'
        payment.save()
        
        # Vérifier si la facture est maintenant totalement payée
        invoice = payment.invoice
        total_paid = invoice.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        if total_paid >= invoice.amount:
            invoice.status = 'paid'
            invoice.save()
        
        serializer = self.get_serializer(payment)
        return Response({
            'success': True,
            'message': 'Paiement validé avec succès.',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """
        Rembourser un paiement
        """
        payment = self.get_object()
        
        if payment.status != 'completed':
            return Response({
                'error': 'Seuls les paiements complétés peuvent être remboursés.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'refunded'
        payment.save()
        
        # Mettre à jour le statut de la facture
        invoice = payment.invoice
        invoice.status = 'overdue'  # Ou un autre statut approprié
        invoice.save()
        
        serializer = self.get_serializer(payment)
        return Response({
            'success': True,
            'message': 'Paiement remboursé avec succès.',
            'data': serializer.data
        })
