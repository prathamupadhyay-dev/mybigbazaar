import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';
import { getOrders } from '../orders/orderStore';

export const ReceiptsScreen = () => {
  const navigation = useNavigation();
  const { transactions, user, activeAddress } = useApp();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Orders' | 'Services'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
    });
  }, []);

  // Merge orders and service transactions into a unified receipts list
  const receiptsList = [
    ...orders.map((ord) => {
      const taxable = ord.pricing?.subtotal - (ord.pricing?.discount || 0);
      const cgst = Math.round((ord.pricing?.tax || 0) / 2);
      const sgst = (ord.pricing?.tax || 0) - cgst;
      return {
        id: `rcpt-ord-${ord.id}`,
        invoiceNo: `INV-2026-${ord.orderNumber.replace('ORD-', '')}`,
        type: 'Order',
        refNumber: ord.orderNumber,
        date: ord.orderDate,
        title: ord.items?.[0]?.title || 'Marketplace Goods',
        items: ord.items || [],
        paymentMode: ord.paymentMode,
        taxableAmount: taxable,
        cgst,
        sgst,
        totalTax: ord.pricing?.tax || 0,
        deliveryFee: ord.pricing?.deliveryFee || 0,
        totalAmount: ord.pricing?.totalAmount || 0,
        customerName: ord.shippingAddress?.fullName || user.fullName,
        customerAddress: `${ord.shippingAddress?.houseNo || '12 Temple Road'}, ${ord.shippingAddress?.street || 'Kumarakom'}, ${ord.shippingAddress?.city || 'Kottayam'}`
      };
    }),
    ...transactions.map((tx) => {
      const taxable = Math.round(tx.amount / 1.18);
      const totalTax = tx.amount - taxable;
      const cgst = Math.round(totalTax / 2);
      const sgst = totalTax - cgst;
      return {
        id: `rcpt-tx-${tx.id}`,
        invoiceNo: `INV-2026-${tx.transactionId.replace('TXN-', '').slice(0, 5)}`,
        type: 'Service',
        refNumber: tx.bookingId || tx.transactionId,
        date: tx.date || '07 Sep 2026',
        title: tx.serviceName || 'Home Service',
        items: [
          {
            title: tx.serviceName || 'Home Service',
            price: taxable,
            quantity: 1
          }
        ],
        paymentMode: tx.paymentMode,
        taxableAmount: taxable,
        cgst,
        sgst,
        totalTax,
        deliveryFee: 0,
        totalAmount: tx.amount,
        customerName: user.fullName || 'John Doe',
        customerAddress: `${activeAddress?.houseNo || '12 Temple Road'}, ${activeAddress?.city || 'Kottayam'}`
      };
    })
  ];

  const filteredReceipts = receiptsList.filter((r) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Orders'
        ? r.type === 'Order'
        : r.type === 'Service';

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : r.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.refNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleDownload = (rcpt) => {
    Alert.alert(
      'Tax Invoice Downloaded',
      `Official GST invoice ${rcpt.invoiceNo} has been saved to your downloads folder.`,
      [{ text: 'OK' }]
    );
  };

  const handleShare = (rcpt) => {
    Alert.alert(
      'Share Invoice',
      `Invoice ${rcpt.invoiceNo} ready to share via WhatsApp, Mail, or Drive.`
    );
  };

  const openInvoiceModal = (rcpt) => {
    setSelectedReceipt(rcpt);
    setInvoiceModalVisible(true);
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipts & Tax Invoices</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by invoice no, item, or order..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['All', 'Orders', 'Services'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Receipts List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredReceipts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={54} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No Receipts Found</Text>
            <Text style={styles.emptySubtitle}>
              Your tax invoices and transaction receipts will appear here automatically.
            </Text>
          </View>
        ) : (
          filteredReceipts.map((rcpt) => (
            <View key={rcpt.id} style={styles.receiptCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceNo}>{rcpt.invoiceNo}</Text>
                  <Text style={styles.refSub}>Ref: {rcpt.refNumber} · {rcpt.date}</Text>
                </View>
                <View style={styles.gstBadge}>
                  <Text style={styles.gstBadgeText}>GST 18% PAID</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.itemIconBox}>
                  <Ionicons
                    name={rcpt.type === 'Order' ? 'cube-outline' : 'construct-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {rcpt.title}
                  </Text>
                  <Text style={styles.itemTaxDetail}>
                    Taxable: ₹{rcpt.taxableAmount.toLocaleString('en-IN')} · GST: ₹{rcpt.totalTax.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.totalAmount}>₹{rcpt.totalAmount.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.modeText}>Paid via {rcpt.paymentMode}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => handleDownload(rcpt)}
                  >
                    <Ionicons name="download-outline" size={14} color={Colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Download</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSolid}
                    onPress={() => openInvoiceModal(rcpt)}
                  >
                    <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnSolidText}>View Tax Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Tax Invoice Full Modal */}
      {selectedReceipt && (
        <Modal visible={invoiceModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tax Invoice / Receipt</Text>
                <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
                {/* Official Letterhead */}
                <View style={styles.letterhead}>
                  <Text style={styles.companyName}>MyBigBazaar Internet Private Limited</Text>
                  <Text style={styles.companySub}>12 Tech Park, Kottayam, Kerala - 686001</Text>
                  <Text style={styles.companyGst}>GSTIN: 32AAACB0000A1Z5 · CIN: U74999KL2026PTC012345</Text>
                </View>

                {/* Invoice Meta */}
                <View style={styles.invoiceMetaCard}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Invoice No:</Text>
                    <Text style={styles.metaVal}>{selectedReceipt.invoiceNo}</Text>
                    <Text style={styles.metaLabel}>Invoice Date:</Text>
                    <Text style={styles.metaVal}>{selectedReceipt.date}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Order/Booking Ref:</Text>
                    <Text style={styles.metaVal}>{selectedReceipt.refNumber}</Text>
                    <Text style={styles.metaLabel}>Payment Mode:</Text>
                    <Text style={styles.metaVal}>{selectedReceipt.paymentMode}</Text>
                  </View>
                </View>

                {/* Billed To */}
                <View style={styles.billedToCard}>
                  <Text style={styles.billedToLabel}>Billed To (Customer):</Text>
                  <Text style={styles.customerName}>{selectedReceipt.customerName}</Text>
                  <Text style={styles.customerAddr}>{selectedReceipt.customerAddress}</Text>
                  <Text style={styles.customerState}>State: Kerala (Code: 32)</Text>
                </View>

                {/* Itemized Table */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.thCell, { flex: 2 }]}>Description</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>HSN/SAC</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                </View>

                {selectedReceipt.items.map((it, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tdCell, { flex: 2 }]} numberOfLines={2}>
                      {it.title || selectedReceipt.title} (x{it.quantity || 1})
                    </Text>
                    <Text style={[styles.tdCell, { flex: 1, textAlign: 'center' }]}>
                      {selectedReceipt.type === 'Order' ? '8518' : '9987'}
                    </Text>
                    <Text style={[styles.tdCell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                      ₹{(it.price * (it.quantity || 1)).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}

                {/* Tax Breakdown */}
                <View style={styles.taxSummary}>
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>Taxable Amount</Text>
                    <Text style={styles.taxValue}>₹{selectedReceipt.taxableAmount.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>Central GST (CGST 9%)</Text>
                    <Text style={styles.taxValue}>₹{selectedReceipt.cgst.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>State GST (SGST 9%)</Text>
                    <Text style={styles.taxValue}>₹{selectedReceipt.sgst.toLocaleString('en-IN')}</Text>
                  </View>
                  {selectedReceipt.deliveryFee > 0 && (
                    <View style={styles.taxRow}>
                      <Text style={styles.taxLabel}>Delivery Charges</Text>
                      <Text style={styles.taxValue}>₹{selectedReceipt.deliveryFee}</Text>
                    </View>
                  )}
                  <View style={styles.divider} />
                  <View style={styles.taxRow}>
                    <Text style={styles.totalDueLabel}>Total Amount Paid</Text>
                    <Text style={styles.totalDueVal}>₹{selectedReceipt.totalAmount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Official Stamp */}
                <View style={styles.signatureBox}>
                  <View style={styles.stampCircle}>
                    <Text style={styles.stampText}>MYBIGBAZAAR</Text>
                    <Text style={styles.stampSub}>VERIFIED</Text>
                  </View>
                  <View style={{ marginLeft: Spacing.md }}>
                    <Text style={styles.signTitle}>Authorized Signatory</Text>
                    <Text style={styles.signSub}>Electronically generated computer tax invoice</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  style={styles.modalShareBtn}
                  onPress={() => handleShare(selectedReceipt)}
                >
                  <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
                  <Text style={styles.modalShareText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDownloadBtn}
                  onPress={() => handleDownload(selectedReceipt)}
                >
                  <Ionicons name="download" size={16} color="#FFFFFF" />
                  <Text style={styles.modalDownloadText}>Download PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0
  },
  backBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Shadows.subtle
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9'
  },
  tabChipActive: {
    backgroundColor: Colors.primary
  },
  tabText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.sm
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.lg
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs
  },
  invoiceNo: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  refSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  gstBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  gstBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: Radii.control,
    marginVertical: Spacing.xs
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.xs,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  itemTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  itemTaxDetail: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  totalAmount: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.primary
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  modeText: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4
  },
  actionBtnOutlineText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11
  },
  actionBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primary,
    gap: 4
  },
  actionBtnSolidText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.md,
    ...Shadows.sheet
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  modalTitle: {
    ...Typography.heading3,
    fontSize: 16,
    color: Colors.textPrimary
  },
  letterhead: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm
  },
  companyName: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  companySub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  companyGst: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2
  },
  invoiceMetaCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: Radii.xs,
    marginBottom: Spacing.sm
  },
  metaCol: {
    flex: 1
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textSecondary
  },
  metaVal: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: 4
  },
  billedToCard: {
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: Radii.xs,
    marginBottom: Spacing.sm
  },
  billedToLabel: {
    fontSize: 10,
    color: Colors.textSecondary
  },
  customerName: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 1
  },
  customerAddr: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1
  },
  customerState: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radii.xs
  },
  thCell: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.textPrimary
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  tdCell: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary
  },
  taxSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.xs,
    padding: Spacing.sm,
    marginTop: Spacing.sm
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  taxLabel: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  taxValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4
  },
  totalDueLabel: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  totalDueVal: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.primary
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  stampCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#059669',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stampText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#059669'
  },
  stampSub: {
    fontSize: 6,
    fontWeight: '800',
    color: '#059669'
  },
  signTitle: {
    ...Typography.captionBold,
    fontSize: 11,
    color: '#065F46'
  },
  signSub: {
    fontSize: 10,
    color: '#047857'
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md
  },
  modalShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    gap: 6
  },
  modalShareText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 13
  },
  modalDownloadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    gap: 6
  },
  modalDownloadText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 13
  }
});

export default ReceiptsScreen;