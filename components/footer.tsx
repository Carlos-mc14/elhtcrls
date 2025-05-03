"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Leaf, Mail, Phone, Instagram, Facebook, Twitter, MapPin, Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <footer className="w-full border-t bg-gradient-to-b from-white to-leaf-light/10">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={item}>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-green p-2 rounded-full">
                <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gradient-green">El Huerto De Carlos</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tu blog especializado en el cultivo y cuidado de plantas. Aprende, comparte y conecta con otros amantes de
              la jardinería.
            </p>

            <div className="flex gap-4 mt-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full text-white focus-visible-ring"
                aria-label="Síguenos en Instagram"
              >
                <Instagram size={16} aria-hidden="true" />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                className="bg-gradient-to-r from-blue-600 to-blue-500 p-2 rounded-full text-white focus-visible-ring"
                aria-label="Síguenos en Facebook"
              >
                <Facebook size={16} aria-hidden="true" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-full text-white focus-visible-ring"
                aria-label="Síguenos en Twitter"
              >
                <Twitter size={16} aria-hidden="true" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="text-sm font-semibold mb-4 text-leaf-dark border-b border-leaf-light/30 pb-2">Enlaces</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Inicio", href: "/" },
                { name: "Blog", href: "/posts" },
                { name: "Tienda", href: "/tienda" },
                { name: "Sobre Nosotros", href: "#" },
              ].map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-leaf-dark transition-colors flex items-center focus-visible-ring rounded-sm"
                  >
                    <span className="bg-leaf-light h-1.5 w-1.5 rounded-full mr-2" aria-hidden="true"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="text-sm font-semibold mb-4 text-leaf-dark border-b border-leaf-light/30 pb-2">Recursos</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Guía de Cultivo", href: "#" },
                { name: "Calendario de Siembra", href: "#" },
                { name: "Preguntas Frecuentes", href: "#" },
                { name: "Consejos de Jardinería", href: "#" },
              ].map((resource) => (
                <motion.li key={resource.name} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link
                    href={resource.href}
                    className="text-gray-600 hover:text-leaf-dark transition-colors flex items-center focus-visible-ring rounded-sm"
                  >
                    <span className="bg-leaf-light h-1.5 w-1.5 rounded-full mr-2" aria-hidden="true"></span>
                    {resource.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="text-sm font-semibold mb-4 text-leaf-dark border-b border-leaf-light/30 pb-2">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-gray-600 flex items-center">
                <Mail className="mr-2 h-4 w-4 text-leaf-medium" aria-hidden="true" />
                <a
                  href="mailto:huerto@nexius.lat"
                  className="hover:text-leaf-dark transition-colors focus-visible-ring rounded-sm"
                >
                  huerto@nexius.lat
                </a>
              </li>
              <li className="text-gray-600 flex items-center">
                <Phone className="mr-2 h-4 w-4 text-leaf-medium" aria-hidden="true" />
                <a
                  href="tel:+51123456789"
                  className="hover:text-leaf-dark transition-colors focus-visible-ring rounded-sm"
                >
                  +51 123 456 789
                </a>
              </li>
              <li className="text-gray-600 flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-leaf-medium" aria-hidden="true" />
                <span>Caraz, Perú</span>
              </li>
              <motion.li whileHover={{ scale: 1.02 }} className="mt-4">
                <Link
                  href="/contacto"
                  className="inline-block px-4 py-2 bg-gradient-green text-white rounded-md text-sm font-medium hover:brightness-110 transition-all shadow-md hover:shadow-lg focus-visible-ring"
                >
                  Enviar mensaje
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-10 pt-6 border-t border-leaf-light/20 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="flex items-center justify-center gap-1">
            © {currentYear} El Huerto De Carlos. Todos los derechos reservados. Hecho con
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <Heart className="h-4 w-4 text-red-500" aria-hidden="true" />
            </motion.span>
            para amantes de las plantas.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
