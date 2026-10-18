import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { ALL_CATEGORY_SELLER_FORMS } from '../utils/carCatalogData';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Car,
  Building2,
  Smartphone,
  Bike,
  Tv,
  Truck,
  Sofa,
  Shirt,
  BookOpen,
  PawPrint,
  Wrench,
  Briefcase
} from 'lucide-react';

const MAC_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif";

const CATEGORY_SIDEBAR_META = {
  cars: { icon: Car, color: '#FF3B30', tint: 'rgba(255, 59, 48, 0.1)' },
  properties: { icon: Building2, color: '#007AFF', tint: 'rgba(0, 122, 255, 0.1)' },
  mobiles: { icon: Smartphone, color: '#34C759', tint: 'rgba(52, 199, 89, 0.1)' },
  bikes: { icon: Bike, color: '#FF2D55', tint: 'rgba(255, 45, 85, 0.1)' },
  'electronics & appliances': { icon: Tv, color: '#AF52DE', tint: 'rgba(175, 82, 222, 0.1)' },
  'commercial vehicles & spares': { icon: Truck, color: '#FF9500', tint: 'rgba(255, 149, 0, 0.1)' },
  furniture: { icon: Sofa, color: '#30B0C7', tint: 'rgba(48, 176, 199, 0.1)' },
  fashion: { icon: Shirt, color: '#E03E8C', tint: 'rgba(224, 62, 140, 0.1)' },
  'books, sports & hobbies': { icon: BookOpen, color: '#5856D6', tint: 'rgba(88, 86, 214, 0.1)' },
  pets: { icon: PawPrint, color: '#A2845E', tint: 'rgba(162, 132, 94, 0.12)' },
  services: { icon: Wrench, color: '#00C7BE', tint: 'rgba(0, 199, 190, 0.1)' },
  jobs: { icon: Briefcase, color: '#0A84FF', tint: 'rgba(10, 132, 255, 0.1)' }
};

function getPresetForCategory(categoryName) {
  const key = (categoryName || '').toLowerCase().trim();
  const matchedKey = Object.keys(ALL_CATEGORY_SELLER_FORMS).find((k) => k.toLowerCase() === key);
  if (matchedKey && ALL_CATEGORY_SELLER_FORMS[matchedKey]) {
    return JSON.parse(JSON.stringify(ALL_CATEGORY_SELLER_FORMS[matchedKey]));
  }
  return {
    category: categoryName,
    title: 'Include some details',
    fields: []
  };
}

export default function MarketplaceSellerForms() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Stored form schemas keyed by lowercase category name (strictly loaded from Backend DB)
  const [allForms, setAllForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const [currentFields, setCurrentFields] = useState([]);
  const [formTitle, setFormTitle] = useState('Include some details');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [toast, setToast] = useState(null);

  // Field Add/Edit Sheet Modal
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);
  const [fieldForm, setFieldForm] = useState({
    id: '',
    key: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: true,
    maxLength: '',
    minValue: '',
    optionsString: '',
    helperText: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load live categories and seller forms strictly from Backend DB
  const loadBackendData = async () => {
    setLoading(true);
    try {
      const formsRes = await apiFetch('/seller-forms', { timeout: 6000 }).catch(() => null);

      if (!formsRes || !formsRes.ok) {
        setAllForms({});
        setCategories([]);
        setSelectedCategory('');
        setCurrentFields([]);
        setDbConnected(false);
        setConnectionError('Backend server or MongoDB database is not connected.');
        setLoading(false);
        return;
      }

      const formsData = await formsRes.json().catch(() => ({}));
      const list = Array.isArray(formsData?.data) ? formsData.data : (Array.isArray(formsData) ? formsData : []);

      if (formsData?.dbConnected === false || list.length === 0) {
        setAllForms({});
        setCategories([]);
        setSelectedCategory('');
        setCurrentFields([]);
        setDbConnected(false);
        setConnectionError(formsData?.message || 'No Seller Forms found in database or DB connection is offline.');
        setLoading(false);
        return;
      }

      const nextForms = {};
      const derivedCats = [];

      list.forEach((f) => {
        const catName = (f.category || '').trim();
        const k = catName.toLowerCase();
        if (k && Array.isArray(f.fields)) {
          nextForms[k] = f;
          if (!derivedCats.some((c) => c.name.toLowerCase() === k)) {
            derivedCats.push({ id: f.categoryId || f._id || catName, name: catName });
          }
        }
      });

      setAllForms(nextForms);
      setCategories(derivedCats);
      setSelectedCategory((prev) => {
        if (prev && derivedCats.some((c) => c.name.toLowerCase() === prev.toLowerCase())) {
          return prev;
        }
        return derivedCats[0]?.name || '';
      });
      setDbConnected(true);
      setConnectionError('');
    } catch {
      setAllForms({});
      setCategories([]);
      setSelectedCategory('');
      setCurrentFields([]);
      setDbConnected(false);
      setConnectionError('Unable to reach Backend API / Database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Load schema when category changes (strictly from allForms loaded from DB)
  useEffect(() => {
    if (!selectedCategory || !dbConnected) {
      setCurrentFields([]);
      setFormTitle('Include some details');
      setIsDirty(false);
      return;
    }
    const key = selectedCategory.toLowerCase().trim();
    const existing = allForms[key];
    setCurrentFields(existing && Array.isArray(existing.fields) ? existing.fields : []);
    setFormTitle(existing?.title || 'Include some details');
    setIsDirty(false);
  }, [selectedCategory, allForms, dbConnected]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  // Save current category form to backend DB
  const handleSaveForm = async () => {
    if (!selectedCategory || !dbConnected) {
      showToast('Cannot save: Backend Database is not connected.', 'error');
      return;
    }
    setIsSaving(true);
    const key = selectedCategory.toLowerCase().trim();
    const payload = {
      category: selectedCategory,
      subCategory: '',
      title: formTitle || 'Include some details',
      fields: currentFields.map((f, i) => ({ ...f, order: i + 1 })),
      isActive: true
    };

    try {
      const res = await apiFetch('/seller-forms', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const resJson = await res.json().catch(() => ({}));
        const savedDoc = resJson?.data || payload;
        setAllForms((prev) => ({ ...prev, [key]: savedDoc }));
        showToast(`Saved "${selectedCategory}" form to database.`);
        setIsDirty(false);
      } else {
        showToast(`Failed to save "${selectedCategory}" form.`, 'error');
      }
    } catch {
      showToast(`Failed to save "${selectedCategory}" form: Backend unreachable.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshFromDb = async () => {
    setIsSyncingAll(true);
    try {
      await loadBackendData();
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleResetPreset = () => {
    if (!selectedCategory || !dbConnected) return;
    const preset = getPresetForCategory(selectedCategory);
    if (Array.isArray(preset.fields) && preset.fields.length > 0) {
      setCurrentFields([...preset.fields]);
      setFormTitle(preset.title || 'Include some details');
      setIsDirty(true);
      showToast(`Restored "${selectedCategory}" default fields. Click Save to update database.`, 'info');
    }
  };

  const openAddFieldModal = () => {
    setEditingFieldIndex(-1);
    setFieldForm({
      id: `field_${Date.now()}`,
      key: '',
      label: '',
      type: 'text',
      placeholder: '',
      required: true,
      maxLength: '',
      minValue: '',
      optionsString: '',
      helperText: ''
    });
    setFieldModalOpen(true);
  };

  const openEditFieldModal = (field, index) => {
    setEditingFieldIndex(index);
    setFieldForm({
      id: field.id || `field_${index}`,
      key: field.key || '',
      label: field.label || '',
      type: field.type || 'text',
      placeholder: field.placeholder || '',
      required: Boolean(field.required),
      maxLength: field.maxLength ? String(field.maxLength) : '',
      minValue: field.minValue !== undefined && field.minValue !== null ? String(field.minValue) : '',
      optionsString: Array.isArray(field.options) ? field.options.join(', ') : '',
      helperText: field.helperText || ''
    });
    setFieldModalOpen(true);
  };

  const handleSaveFieldModal = (e) => {
    e.preventDefault();
    if (!fieldForm.label.trim()) return;

    const cleanKey =
      fieldForm.key.trim() ||
      fieldForm.label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');

    const optionsArray =
      fieldForm.type === 'segmented' || fieldForm.type === 'select'
        ? fieldForm.optionsString
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const newFieldObj = {
      id: fieldForm.id || `f_${Date.now()}`,
      key: cleanKey,
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      placeholder: fieldForm.placeholder.trim() || `${fieldForm.label.trim()}${fieldForm.required ? ' *' : ''}`,
      required: Boolean(fieldForm.required),
      maxLength: fieldForm.maxLength ? Number(fieldForm.maxLength) : null,
      minValue: fieldForm.minValue !== '' ? Number(fieldForm.minValue) : null,
      options: optionsArray,
      helperText: fieldForm.helperText.trim(),
      order: editingFieldIndex >= 0 ? editingFieldIndex + 1 : currentFields.length + 1
    };

    if (editingFieldIndex >= 0) {
      const updated = [...currentFields];
      updated[editingFieldIndex] = newFieldObj;
      setCurrentFields(updated);
    } else {
      setCurrentFields([...currentFields, newFieldObj]);
    }
    setIsDirty(true);
    setFieldModalOpen(false);
  };

  const handleDeleteField = (idx) => {
    setCurrentFields((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const handleMoveField = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentFields.length) return;
    const copy = [...currentFields];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setCurrentFields(copy);
    setIsDirty(true);
  };

  const renderFieldTypePill = (type) => {
    const stylesMap = {
      brand_model_variant: {
        bg: 'rgba(255, 59, 48, 0.08)',
        color: '#D70015',
        border: 'rgba(255, 59, 48, 0.2)',
        label: 'Brand → Model → Variant'
      },
      segmented: {
        bg: 'rgba(175, 82, 222, 0.08)',
        color: '#8944AB',
        border: 'rgba(175, 82, 222, 0.2)',
        label: 'Segmented'
      },
      select: {
        bg: 'rgba(0, 122, 255, 0.08)',
        color: '#0062CC',
        border: 'rgba(0, 122, 255, 0.2)',
        label: 'Dropdown'
      },
      number: {
        bg: 'rgba(52, 199, 89, 0.08)',
        color: '#248A3D',
        border: 'rgba(52, 199, 89, 0.2)',
        label: 'Number'
      },
      text: {
        bg: 'rgba(142, 142, 147, 0.1)',
        color: '#3A3A3C',
        border: 'rgba(142, 142, 147, 0.22)',
        label: 'Text'
      }
    };
    const s = stylesMap[type] || stylesMap.text;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`
        }}
      >
        {s.label}
      </span>
    );
  };

  const activeCategoryMeta =
    CATEGORY_SIDEBAR_META[selectedCategory.toLowerCase().trim()] || CATEGORY_SIDEBAR_META.cars;
  const ActiveCatIcon = activeCategoryMeta.icon;

  return (
    <div
      style={{
        fontFamily: MAC_FONT,
        color: '#1D1D1F',
        paddingBottom: '36px',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            color: '#1D1D1F',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12)',
            fontWeight: 600,
            fontSize: '13px'
          }}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} color="#FF3B30" />
          ) : (
            <CheckCircle2 size={16} color="#34C759" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Minimalist Seller Form Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.09)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Minimalist Top Bar */}
        <div
          style={{
            height: '56px',
            padding: '0 20px',
            backgroundColor: '#FAFAFC',
            borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#007AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Layers size={15} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.01em' }}>
              Seller Forms
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleRefreshFromDb}
              disabled={isSyncingAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#FFFFFF',
                color: '#1D1D1F',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isSyncingAll ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleSaveForm}
              disabled={isSaving || !dbConnected || !selectedCategory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !dbConnected || !selectedCategory ? '#D1D1D6' : '#007AFF',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12px',
                cursor: !dbConnected || !selectedCategory ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={13} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* 2-Pane Minimalist Layout (Categories Sidebar + Fields Editor) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            minHeight: '640px'
          }}
        >
          {/* Left Pane: Categories */}
          <div
            style={{
              backgroundColor: '#F5F5F7',
              borderRight: '1px solid rgba(0, 0, 0, 0.07)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                padding: '6px 10px'
              }}
            >
              <Search size={13} color="#8E8E93" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#1D1D1F',
                  width: '100%',
                  fontFamily: MAC_FONT
                }}
              />
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#86868B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0 6px'
              }}
            >
              Categories ({filteredCategories.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#86868B', fontSize: '12px' }}>
                  Loading...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: '#86868B',
                    fontSize: '12px'
                  }}
                >
                  No categories found
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  const catKey = cat.name.toLowerCase().trim();
                  const meta = CATEGORY_SIDEBAR_META[catKey] || CATEGORY_SIDEBAR_META.cars;
                  const IconComp = meta.icon;
                  const schemaObj = allForms[catKey];
                  const count = Array.isArray(schemaObj?.fields) ? schemaObj.fields.length : 0;

                  return (
                    <button
                      key={cat.id || cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#007AFF' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#1D1D1F',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : meta.tint,
                            color: isSelected ? '#FFFFFF' : meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComp size={13} />
                        </div>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: isSelected ? 600 : 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '999px',
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(118, 118, 128, 0.12)',
                          color: isSelected ? '#FFFFFF' : '#6E6E73',
                          flexShrink: 0
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Form Fields Editor */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#86868B',
                  fontSize: '13px'
                }}
              >
                Loading Seller Forms from Database...
              </div>
            ) : !dbConnected || !selectedCategory || categories.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 24px',
                  textAlign: 'center'
                }}
              >
                <AlertCircle size={28} color="#8E8E93" style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1D1D1F' }}>
                  No Seller Forms Available
                </div>
                <div style={{ fontSize: '12.5px', color: '#86868B', marginTop: '4px', maxWidth: '400px' }}>
                  {connectionError || 'Database connection is unavailable.'}
                </div>
                <button
                  type="button"
                  onClick={loadBackendData}
                  style={{
                    marginTop: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: '#FFFFFF',
                    color: '#1D1D1F',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} />
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.07)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: activeCategoryMeta.tint,
                        color: activeCategoryMeta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ActiveCatIcon size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1D1D1F' }}>
                          {selectedCategory}
                        </h2>
                        {isDirty && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(255, 149, 0, 0.14)',
                              color: '#C93400'
                            }}
                          >
                            Unsaved
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#86868B', marginTop: '2px' }}>
                        {currentFields.length} fields configured
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResetPreset}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        backgroundColor: '#FFFFFF',
                        color: '#1D1D1F',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={13} />
                      Reset Default
                    </button>

                    <button
                      type="button"
                      onClick={openAddFieldModal}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#1D1D1F',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      Add Field
                    </button>
                  </div>
                </div>

                {/* Form Heading Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: '#FAFAFC'
                  }}
                >
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1D1D1F' }}>
                    Form Title
                  </span>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Include some details"
                    style={{
                      width: '280px',
                      padding: '6px 10px',
                      borderRadius: '7px',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      fontSize: '12.5px',
                      color: '#1D1D1F',
                      backgroundColor: '#FFFFFF',
                      fontFamily: MAC_FONT
                    }}
                  />
                </div>

                {/* Field List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentFields.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 20px',
                        textAlign: 'center',
                        borderRadius: '10px',
                        border: '1px dashed rgba(0, 0, 0, 0.12)',
                        color: '#86868B',
                        fontSize: '12.5px'
                      }}
                    >
                      No fields configured for this category. Click "Add Field" to create one.
                    </div>
                  ) : (
                    currentFields.map((field, index) => (
                      <div
                        key={field.id || index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              backgroundColor: '#F5F5F7',
                              color: '#6E6E73',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '1px'
                            }}
                          >
                            {index + 1}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1D1D1F' }}>
                                {field.label}
                              </span>
                              {field.required ? (
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(255, 59, 48, 0.08)',
                                    color: '#D70015'
                                  }}
                                >
                                  Required
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 500,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#F5F5F7',
                                    color: '#86868B'
                                  }}
                                >
                                  Optional
                                </span>
                              )}
                              {renderFieldTypePill(field.type)}
                              <code
                                style={{
                                  fontSize: '11px',
                                  backgroundColor: '#F5F5F7',
                                  color: '#6E6E73',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {field.key}
                              </code>
                            </div>

                            {Array.isArray(field.options) && field.options.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                {field.options.map((opt, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      borderRadius: '5px',
                                      backgroundColor: '#F5F5F7',
                                      color: '#3A3A3C'
                                    }}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveField(index, -1)}
                            disabled={index === 0}
                            title="Move Up"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: '1px solid rgba(0,0,0,0.08)',
                              backgroundColor: '#FFFFFF',
                              color: index === 0 ? '#C7C7CC' : '#1D1D1F',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: index === 0 ? 'default' : 'pointer'
                            }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(index, 1)}
                            disabled={index === currentFields.length - 1}
                            title="Move Down"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: '1px solid rgba(0,0,0,0.08)',
                              backgroundColor: '#FFFFFF',
                              color: index === currentFields.length - 1 ? '#C7C7CC' : '#1D1D1F',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: index === currentFields.length - 1 ? 'default' : 'pointer'
                            }}
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditFieldModal(field, index)}
                            title="Edit Field"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: '1px solid rgba(0,0,0,0.08)',
                              backgroundColor: '#FFFFFF',
                              color: '#007AFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(index)}
                            title="Delete Field"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: '1px solid rgba(255,59,48,0.18)',
                              backgroundColor: 'rgba(255,59,48,0.05)',
                              color: '#FF3B30',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Field Modal */}
      {fieldModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
              overflow: 'hidden',
              fontFamily: MAC_FONT
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1D1D1F' }}>
                {editingFieldIndex >= 0 ? 'Edit Field' : 'Add Field'}
              </span>
              <button
                type="button"
                onClick={() => setFieldModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#86868B',
                  padding: '4px'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFieldModal} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1D1D1F', marginBottom: '4px' }}>
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Year, Fuel, BHK"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.14)',
                    fontSize: '13px',
                    fontFamily: MAC_FONT
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1D1D1F', marginBottom: '4px' }}>
                    Field Type
                  </label>
                  <select
                    value={fieldForm.type}
                    onChange={(e) => setFieldForm((p) => ({ ...p, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.14)',
                      fontSize: '13px',
                      fontFamily: MAC_FONT,
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Numeric Field</option>
                    <option value="select">Dropdown Select</option>
                    <option value="segmented">Segmented Control</option>
                    <option value="brand_model_variant">Brand → Model → Variant</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1D1D1F', marginBottom: '4px' }}>
                    Attribute Key
                  </label>
                  <input
                    type="text"
                    value={fieldForm.key}
                    onChange={(e) => setFieldForm((p) => ({ ...p, key: e.target.value }))}
                    placeholder="Auto-generated"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.14)',
                      fontSize: '13px',
                      fontFamily: MAC_FONT
                    }}
                  />
                </div>
              </div>

              {(fieldForm.type === 'select' || fieldForm.type === 'segmented') && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1D1D1F', marginBottom: '4px' }}>
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={fieldForm.optionsString}
                    onChange={(e) => setFieldForm((p) => ({ ...p, optionsString: e.target.value }))}
                    placeholder="Option 1, Option 2, Option 3"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.14)',
                      fontSize: '13px',
                      fontFamily: MAC_FONT
                    }}
                  />
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 500, color: '#1D1D1F', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={fieldForm.required}
                  onChange={(e) => setFieldForm((p) => ({ ...p, required: e.target.checked }))}
                />
                Required field
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setFieldModalOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: '#FFFFFF',
                    color: '#1D1D1F',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
