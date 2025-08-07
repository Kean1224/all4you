import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/auctions', label: 'Auctions' },
  { href: '/admin/lots', label: 'Lots' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/payments', label: '💰 Payments' },
  { href: '/admin/assign-seller', label: 'Assign Seller' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-gradient-to-b from-[#1a2a2f] to-[#22343a] border-r border-white/10 min-h-screen w-56 p-6 flex flex-col gap-4 sticky top-0 shadow-xl">
      <h2 className="text-xl font-extrabold text-green-400 mb-6 tracking-wide">Admin Panel</h2>
      <nav className="flex flex-col gap-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 rounded-lg font-semibold transition-all text-green-100 hover:bg-green-800/60 hover:text-white ${pathname === link.href ? 'bg-green-700/80 text-white shadow-lg' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
