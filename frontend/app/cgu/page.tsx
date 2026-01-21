'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText } from 'lucide-react';
import TableOfContents from '@/components/ui/TableOfContents';

const sections = [
  { id: 'objet', title: '1. Objet', level: 0 },
  { id: 'acceptation', title: '2. Acceptation des CGU', level: 0 },
  { id: 'compte', title: '3. Création de compte', level: 0 },
  { id: 'utilisation', title: '4. Utilisation du service', level: 0 },
  { id: 'obligations', title: '5. Obligations de l\'utilisateur', level: 0 },
  { id: 'propriete', title: '6. Propriété intellectuelle', level: 0 },
  { id: 'responsabilite', title: '7. Limitation de responsabilité', level: 0 },
  { id: 'modification', title: '8. Modification des CGU', level: 0 },
  { id: 'contact', title: '9. Contact', level: 0 },
];

export default function CGUPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Header fixe avec glassmorphisme */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo à gauche */}
          <Link href="/">
            <Image
              src="/logo/vida-logo.svg"
              alt="VIDA Logo"
              width={150}
              height={50}
            />
          </Link>
        </div>
      </div>
      
      {/* Table of Contents - Fixe à gauche */}
      <div className="fixed left-6 top-24 z-40 hidden xl:block">
        <TableOfContents sections={sections} alwaysExpanded />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-[360px]">

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-xs text-gray-500">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section id="objet">
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Objet</h2>
            <p className="text-sm text-sm text-gray-600 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation
              de la plateforme VIDA, un service de gestion de rendez-vous médicaux en ligne
              pour la Clinique Ophtalmologique VIDA.
            </p>
          </section>

          <section id="acceptation">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Acceptation des CGU</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              En créant un compte sur la plateforme VIDA, vous acceptez sans réserve les
              présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser
              nos services.
            </p>
          </section>

          <section id="compte">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Création de compte</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Pour utiliser nos services, vous devez créer un compte en fournissant des
              informations exactes et à jour. Vous êtes responsable de :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>La confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées depuis votre compte</li>
              <li>La mise à jour de vos informations personnelles</li>
            </ul>
          </section>

          <section id="utilisation">
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Utilisation du service</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              La plateforme VIDA vous permet de :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>Prendre rendez-vous en ligne avec nos ophtalmologues</li>
              <li>Consulter et gérer vos rendez-vous</li>
              <li>Accéder à votre dossier médical (fonctionnalité à venir)</li>
              <li>Recevoir des rappels de rendez-vous</li>
            </ul>
          </section>

          <section id="obligations">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Obligations de l'utilisateur</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>Fournir des informations exactes et complètes</li>
              <li>Respecter les horaires de rendez-vous</li>
              <li>Annuler vos rendez-vous au moins 24h à l'avance</li>
              <li>Ne pas utiliser le service à des fins frauduleuses</li>
              <li>Respecter les autres utilisateurs et le personnel médical</li>
            </ul>
          </section>

          <section id="propriete">
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Propriété intellectuelle</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tous les contenus présents sur la plateforme VIDA (textes, images, logos,
              graphismes) sont la propriété exclusive de la Clinique VIDA et sont protégés
              par les lois sur la propriété intellectuelle.
            </p>
          </section>

          <section id="responsabilite">
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation de responsabilité</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              La Clinique VIDA met tout en œuvre pour assurer la disponibilité et la sécurité
              de la plateforme, mais ne peut garantir un accès ininterrompu. Nous ne saurions
              être tenus responsables des dommages indirects résultant de l'utilisation ou de
              l'impossibilité d'utiliser nos services.
            </p>
          </section>

          <section id="modification">
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Modification des CGU</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les
              modifications entreront en vigueur dès leur publication sur la plateforme. Il
              est de votre responsabilité de consulter régulièrement les CGU.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pour toute question concernant ces CGU, vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Centre Médical VIDA</strong>
                <br />
                Adresse : 08 Bis rue Mboko, Moungali, Brazzaville, Congo
                <br />
                Téléphone : 06 569 12 35 / 05 745 36 88
                <br />
                Email : centremedvida@gmail.com
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

