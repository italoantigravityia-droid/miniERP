import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import { Package, Users, ShoppingCart, LayoutDashboard, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Antigravity ERP",
  description: "Mini ERP System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <Package size={28} />
              <span>Mini ERP</span>
            </div>
            <nav>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link href="/">
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/clientes">
                    <Users size={20} />
                    Clientes
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/produtos">
                    <Package size={20} />
                    Produtos
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/pdv">
                    <ShoppingCart size={20} />
                    PDV
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/relatorios">
                    <FileText size={20} />
                    Relatórios
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          
          <div className={styles.mainContent}>
            <header className={styles.header}>
              <h1 className={styles.pageTitle}>Sistema de Gestão</h1>
            </header>
            
            <main className={styles.contentArea}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
