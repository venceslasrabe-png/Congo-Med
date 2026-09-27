import { Order, StoreSettings } from '../types';

export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 FCFA';
  }
  return (
    new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA'
  );
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMD-${year}-${random}`;
}

export function generateInvoiceNumber(orderNumber: string): string {
  return orderNumber.replace('CMD-', 'FAC-');
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DEV-${year}-${random}`;
}

export function buildWhatsAppMessage(order: Order, settings: StoreSettings): string {
  const isQuote = order.orderType === 'quote';
  const title = isQuote
    ? `📋 *DEMANDE DE DEVIS MÉDICAL PROFORMA*`
    : `🏥 *NOUVELLE COMMANDE MÉDICALE - ${settings.storeName.toUpperCase()}*`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n` +
        `   • Réf: \`${item.reference}\`\n` +
        `   • Qté: *${item.quantity}*\n` +
        `   • P.U: ${formatFCFA(item.unitPrice)}\n` +
        `   • Total ligne: *${formatFCFA(item.totalPrice)}*`
    )
    .join('\n\n');

  const message = `${title}
───────────────────────────────
*N° Commande :* ${order.orderNumber}
*Date :* ${formatDate(order.createdAt)}

👤 *INFORMATIONS DU CLIENT / ÉTABLISSEMENT*
• *Nom & Prénom :* ${order.customer.fullName}
• *Téléphone / WhatsApp :* ${order.customer.phone}
• *E-mail :* ${order.customer.email || 'Non renseigné'}
• *Type de structure :* ${order.customer.establishmentType}
• *Nom de l'établissement :* ${order.customer.establishmentName || 'Non spécifié'}
• *Ville de livraison :* ${order.customer.city}
• *Adresse complète :* ${order.customer.address}
${order.customer.deliveryNotes ? `• *Instructions de livraison :* ${order.customer.deliveryNotes}\n` : ''}
📦 *RÉCAPITULATIF DES PRODUITS (${order.items.length}) :*
${itemsList}

───────────────────────────────
💰 *TOTAL GÉNÉRAL : ${formatFCFA(order.totalAmount)}*
${isQuote ? '*(Demande de Devis pour validation tarifaire et disponibilité)*' : '*(Mode de règlement : Paiement à la livraison / Virement pro)*'}

Merci de bien vouloir confirmer la prise en charge et le délai d'acheminement sur nos locaux.
───────────────────────────────
_Généré via la plateforme ${settings.storeName}_`;

  return message;
}

export function getWhatsAppUrl(phoneRaw: string, message: string): string {
  // sanitize phone number: only digits
  const cleanPhone = phoneRaw.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
