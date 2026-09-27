import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Phone,
  CheckCircle2,
  Copy,
  Download,
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  Share2,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import {
  formatFCFA,
  formatDate,
  buildWhatsAppMessage,
  getWhatsAppUrl,
} from '../utils/format';

interface InvoiceViewModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  order,
  onClose,
}) => {
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const isQuote = order.orderType === 'quote';
  const docTitle = isQuote ? 'DEVIS PROFORMA' : 'BON DE COMMANDE OFFICIEL';
  const whatsappMsg = buildWhatsAppMessage(order, settings);
  const whatsappUrl = getWhatsAppUrl(settings.whatsappRaw, whatsappMsg);

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(whatsappMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dedicated Print Engine (Clean A4 without UI clutter)
  const handlePrint = () => {
    setIsPrinting(true);

    try {
      // Create hidden iframe for completely isolated and pristine A4 printing
      const existingIframe = document.getElementById('print-invoice-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'print-invoice-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const docContent = invoiceRef.current?.innerHTML || '';

      const printHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${order.orderNumber} - ${settings.storeName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10px;
      font-size: 12px;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .header-bar {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 15px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 800;
      font-size: 11px;
    }
    .totals-box {
      margin-top: 15px;
      margin-left: auto;
      width: 280px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .total-due {
      border-top: 2px solid #0f172a;
      padding-top: 6px;
      margin-top: 6px;
      font-weight: 900;
      font-size: 14px;
      color: #0369a1;
    }
    .signatures {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-box {
      width: 45%;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  ${docContent}
</body>
</html>`;

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printHtml);
        iframeDoc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setIsPrinting(false);
        }, 400);
      } else {
        // Fallback to direct print
        window.print();
        setIsPrinting(false);
      }
    } catch (e) {
      console.warn('Iframe print fallback to window.print():', e);
      window.print();
      setIsPrinting(false);
    }
  };

  // Download standalone printable HTML/PDF file
  const handleDownloadFile = () => {
    const docContent = invoiceRef.current?.innerHTML || '';
    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${order.orderNumber} - CongoMed</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    body { font-family: system-ui, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 25px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8fafc; padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style>
</head>
<body>
  <div style="max-w: 800px; margin: 0 auto;">
    ${docContent}
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_${order.orderNumber}_CongoMed.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print-modal-container">
      {/* Outer Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh] print-modal-box">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 block">
                {isQuote ? 'Devis Proforma Préparé' : 'Commande Enregistrée avec Succès !'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {order.orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Primary Print / PDF Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
              title="Ouvre la boîte d'impression pour imprimer ou enregistrer en PDF"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>{isPrinting ? 'Préparation...' : 'Imprimer / PDF'}</span>
            </button>

            {/* Direct File Download */}
            <button
              onClick={handleDownloadFile}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Télécharger le document prêt à imprimer"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>

            {/* Direct WhatsApp Send CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            {/* Copy button */}
            <button
              onClick={handleCopyMessage}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Copier le message WhatsApp formaté"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div
          ref={invoiceRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-800 bg-white print-doc-body"
        >
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-sky-600 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-lg">
                  +
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {settings.storeName}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                {settings.tagline}
              </p>
              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <p>📍 {settings.address}, {settings.city} - {settings.country}</p>
                <p>📞 WhatsApp Direct : <strong className="text-slate-900">{settings.whatsappNumber}</strong></p>
                <p>✉️ {settings.email}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  RCCM : {settings.rccm} | NIF : {settings.nif}
                </p>
              </div>
            </div>

            {/* Document Details Box */}
            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-slate-200">
              <span className="inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 mb-2">
                {docTitle}
              </span>
              <p className="text-lg font-black text-slate-900 font-mono">
                {order.orderNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Réf. Facture : <span className="font-mono font-bold text-slate-700">{order.invoiceNumber}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date : <strong>{formatDate(order.createdAt)}</strong>
              </p>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Statut : {order.status}
              </p>
            </div>
          </div>

          {/* Client & Delivery Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 print-break-inside-avoid">
            {/* Client info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Client & Établissement</span>
              </h4>
              <p className="text-sm font-extrabold text-slate-900">
                {order.customer.fullName}
              </p>
              {order.customer.establishmentName && (
                <p className="text-xs font-bold text-sky-800 mt-0.5">
                  {order.customer.establishmentName}
                </p>
              )}
              <p className="text-xs text-slate-600 mt-0.5">
                Type : {order.customer.establishmentType}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                📞 WhatsApp : <strong>{order.customer.phone}</strong>
              </p>
              {order.customer.email && (
                <p className="text-xs text-slate-600">
                  ✉️ {order.customer.email}
                </p>
              )}
            </div>

            {/* Delivery info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Destination de Livraison</span>
              </h4>
              <p className="text-xs font-bold text-slate-900">
                Ville : <span className="font-extrabold text-sky-700">{order.customer.city}</span>
              </p>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Adresse : <strong>{order.customer.address}</strong>
              </p>
              {order.customer.deliveryNotes && (
                <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Instructions : </span>
                  {order.customer.deliveryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Products Table with images */}
          <div className="overflow-x-auto my-6 border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Réf.</th>
                  <th className="py-3 px-3">Visuel</th>
                  <th className="py-3 px-3">Désignation du Dispositif Médical</th>
                  <th className="py-3 px-3 text-center">Qté</th>
                  <th className="py-3 px-3 text-right">Prix Unitaire</th>
                  <th className="py-3 px-3 text-right">Total (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="py-3 px-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 leading-tight">
                        {item.name}
                      </p>
                      <div className="flex gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Marque : {item.brand}</span>
                        {item.packaging && <span>• Cond : {item.packaging}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800 text-sm">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatFCFA(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatFCFA(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 my-6 pt-2 print-break-inside-avoid">
            <div className="text-xs text-slate-600 max-w-sm space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">
                  Conditions de règlement & Garantie :
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paiement à la livraison contre décharge, par chèque certifié, virement bancaire ou Mobile Money (Airtel Money / MTN Mobile Money). Tous nos dispositifs médicaux disposent de certificats de conformité CE / ISO.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT :</span>
                <span className="font-semibold text-slate-900">
                  {formatFCFA(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (Exonération médicale) :</span>
                <span className="font-semibold text-slate-700">0 FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-semibold text-emerald-700">Inclus / Offert</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                <span>NET À PAYER :</span>
                <span className="text-sky-700 font-extrabold">
                  {formatFCFA(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Stamp and signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200 text-xs text-slate-500 print-break-inside-avoid">
            <div>
              <p className="font-bold text-slate-700">Pour le Client / Réceptionnaire :</p>
              <p className="text-[11px] text-slate-400 mt-1">Date, Nom, Signature & Cachet</p>
              <div className="h-16 border-b border-dashed border-slate-300 mt-2"></div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">Pour la Direction {settings.storeName} :</p>
              <p className="text-[11px] text-slate-400 mt-1">Visa & Cachet Médical Réglementaire</p>
              <div className="h-16 flex items-center justify-end">
                <div className="px-3 py-1.5 border-2 border-sky-600/30 rounded-lg text-sky-700/60 font-mono text-[10px] font-black uppercase rotate-[-3deg]">
                  CONGOMED MEDICAL • SARL
                </div>
              </div>
            </div>
          </div>

          {/* Footer notice */}
          <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100 mt-6 print-break-inside-avoid">
            Document officiel généré le {formatDate(order.createdAt)} • Valable 30 jours pour toute structure médicale en République du Congo.
          </div>
        </div>

        {/* Bottom Bar: Action buttons */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span className="text-slate-500">Astuce : </span>
            <span>Dans la boîte d'impression, sélectionnez <strong>"Enregistrer au format PDF"</strong>.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            {/* Bottom Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>

            {/* Bottom WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Envoyer sur WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
