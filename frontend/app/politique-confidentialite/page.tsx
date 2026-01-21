'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import TableOfContents from '@/components/ui/TableOfContents';

const sections = [
  { id: 'introduction', title: '1. Introduction', level: 0 },
  { id: 'donnees', title: '2. Données collectées', level: 0 },
  { id: 'finalites', title: '3. Finalités du traitement', level: 0 },
  { id: 'base-legale', title: '4. Base légale du traitement', level: 0 },
  { id: 'destinataires', title: '5. Destinataires des données', level: 0 },
  { id: 'conservation', title: '6. Durée de conservation', level: 0 },
  { id: 'droits', title: '7. Vos droits', level: 0 },
  { id: 'securite', title: '8. Sécurité des données', level: 0 },
  { id: 'cookies', title: '9. Cookies', level: 0 },
  { id: 'modifications', title: '10. Modifications', level: 0 },
  { id: 'contact', title: '11. Contact', level: 0 },
];

export default function PolitiqueConfidentialitePage() {
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
            Politique de Confidentialité
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
          <section id="introduction">
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Le Centre Médical VIDA s'engage à protéger la confidentialité et la
              sécurité de vos données personnelles. Cette politique explique comment nous
              collectons, utilisons et protégeons vos informations conformément à la
              réglementation en vigueur sur la protection des données.
            </p>
          </section>

          <section id="donnees">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Données d'identification :</strong> nom, prénom, date de naissance
              </li>
              <li>
                <strong>Coordonnées :</strong> adresse email, numéro de téléphone, adresse postale
              </li>
              <li>
                <strong>Données médicales :</strong> historique de consultations, prescriptions,
                résultats d'examens (avec votre consentement explicite)
              </li>
              <li>
                <strong>Données de connexion :</strong> adresse IP, logs de connexion, cookies
              </li>
            </ul>
          </section>

          <section id="finalites">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>Gérer vos rendez-vous médicaux</li>
              <li>Assurer le suivi médical et la continuité des soins</li>
              <li>Vous envoyer des rappels de rendez-vous</li>
              <li>Améliorer la qualité de nos services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Gérer la facturation et les remboursements</li>
            </ul>
          </section>

          <section id="base-legale">
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Base légale du traitement</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Le traitement de vos données repose sur :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4 mt-3">
              <li>Votre consentement explicite pour les données médicales</li>
              <li>L'exécution du contrat de soins</li>
              <li>Le respect de nos obligations légales</li>
              <li>Notre intérêt légitime à améliorer nos services</li>
            </ul>
          </section>

          <section id="destinataires">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Destinataires des données</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Vos données peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>Le personnel médical et administratif de la clinique</li>
              <li>Les prestataires techniques assurant l'hébergement et la maintenance</li>
              <li>Les organismes de santé et d'assurance (avec votre accord)</li>
              <li>Les autorités compétentes en cas d'obligation légale</li>
            </ul>
          </section>

          <section id="conservation">
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Durée de conservation</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour
              lesquelles elles ont été collectées, et conformément aux obligations légales :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4 mt-3">
              <li>Dossier médical : 20 ans après la dernière consultation</li>
              <li>Données de facturation : 10 ans</li>
              <li>Données de compte : jusqu'à suppression de votre compte</li>
            </ul>
          </section>

          <section id="droits">
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Vos droits</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Conformément à la réglementation, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Droit d'accès :</strong> obtenir une copie de vos données
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos données inexactes
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> supprimer vos données (sous conditions)
              </li>
              <li>
                <strong>Droit à la limitation :</strong> limiter le traitement de vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré
              </li>
              <li>
                <strong>Droit d'opposition :</strong> vous opposer au traitement de vos données
              </li>
              <li>
                <strong>Droit de retirer votre consentement :</strong> à tout moment
              </li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              Pour exercer vos droits, contactez-nous à : centremedvida@gmail.com
            </p>
          </section>

          <section id="securite">
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Sécurité des données</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données contre tout accès non autorisé, perte, destruction ou
              divulgation :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4 mt-3">
              <li>Chiffrement des données sensibles (SSL/TLS)</li>
              <li>Authentification sécurisée avec mots de passe robustes</li>
              <li>Limitation des accès aux données (principe du moindre privilège)</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Hébergement certifié HDS (Hébergeur de Données de Santé)</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez
              gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section id="modifications">
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Modifications</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique à tout moment. Les
              modifications seront publiées sur cette page avec une nouvelle date de mise à jour.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité :
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
