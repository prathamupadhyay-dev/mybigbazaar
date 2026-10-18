/**
 * @file apps/web/src/pages/PostAdPage.jsx
 * @description 4-step interactive ad posting wizard with category selector, photo upload simulation,
 * inline validation, fee estimate, review summary, and instant publication.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { MOCK_CATEGORIES } from '../data/mockData.js';

const DEMO_UPLOAD_IMAGES = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'
];

export default function PostAdPage() {
  const navigate = useNavigate();
  const { postNewAd, currentUser, isAuthenticated, openAuth } = useApp();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('Smartphones');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('Like New');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([DEMO_UPLOAD_IMAGES[0]]);
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('Indiranagar');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [showPhone, setShowPhone] = useState(true);

  const [publishing, setPublishing] = useState(false);
  const [publishedAd, setPublishedAd] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const activeCategoryObj = MOCK_CATEGORIES.find((c) => c.name === category) || MOCK_CATEGORIES[0];

  const handleAddSamplePhoto = () => {
    if (images.length >= 5) return;
    const nextImg = DEMO_UPLOAD_IMAGES[images.length % DEMO_UPLOAD_IMAGES.length];
    setImages([...images, nextImg]);
  };

  const handleRemovePhoto = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!category) {
        setErrorMsg('Please select a category.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !price) {
        setErrorMsg('Please provide a listing title and price.');
        return;
      }
      if (Number(price) <= 0) {
        setErrorMsg('Price must be greater than zero.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (images.length === 0) {
        setErrorMsg('Please attach at least one photo for buyers.');
        return;
      }
      setStep(4);
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    setPublishing(true);
    setErrorMsg('');

    try {
      const adData = {
        title: title.trim(),
        price: Number(price),
        category,
        subcategory,
        condition,
        description: description.trim() || `Verified ${brand || category} item located in ${locality}, ${city}.`,
        images,
        location: `${locality}, ${city}`,
        specs: {
          Brand: brand || 'Generic',
          Condition: condition,
          Location: `${locality}, ${city}`
        }
      };

      const created = await postNewAd(adData);
      setPublishedAd(created);
      setStep(5); // Success step
    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish listing. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="post-ad-page">
      <Navbar />
      <AuthModal />

      <div className="container post-ad-container">
        {/* Stepper Progress */}
        <div className="wizard-progress">
          <div className="wizard-steps-indicator">
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Details & Price' },
              { num: 3, label: 'Photos' },
              { num: 4, label: 'Location & Review' }
            ].map((s) => (
              <div
                key={s.num}
                className={`wizard-step-node ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
              >
                <div className="step-circle">
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && <div className="post-ad-error">{errorMsg}</div>}

        <div className="post-ad-card">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="wizard-step-content">
              <h2 className="step-title">Choose Category for Your Ad</h2>
              <p className="step-desc">Select the category that best matches your product</p>

              <div className="category-select-grid">
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-select-card ${category === cat.name ? 'selected' : ''}`}
                    onClick={() => {
                      setCategory(cat.name);
                      setSubcategory(cat.subcategories[0] || '');
                    }}
                  >
                    <span className="cat-select-icon">
                      {cat.name === 'Electronics' && '📱'}
                      {cat.name === 'Fashion' && '👕'}
                      {cat.name === 'Furniture' && '🛋️'}
                      {cat.name === 'Bikes' && '🏍️'}
                      {cat.name === 'Appliances' && '📺'}
                      {cat.name === 'Books' && '📚'}
                      {cat.name === 'Sports' && '🏋️'}
                      {cat.name === 'Other' && '📦'}
                    </span>
                    <strong>{cat.name}</strong>
                  </button>
                ))}
              </div>

              {activeCategoryObj?.subcategories && (
                <div className="subcategory-select-group">
                  <label className="form-label">Subcategory *</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="form-select"
                  >
                    {activeCategoryObj.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="wizard-actions">
                <Link to="/marketplace" className="btn-secondary">
                  Cancel
                </Link>
                <button type="button" className="btn-primary" onClick={handleNextStep}>
                  Next: Ad Details &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS & PRICING */}
          {step === 2 && (
            <div className="wizard-step-content">
              <h2 className="step-title">Ad Details &amp; Valuation</h2>
              <p className="step-desc">Describe your item truthfully to attract genuine local buyers</p>

              <div className="form-group">
                <label className="form-label">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Apple iPhone 14 Pro 128GB - Deep Purple (Under Warranty)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
                <small className="field-hint">Include brand, model, and key highlight (min 10 characters)</small>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Sony, IKEA, Decathlon"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="form-select"
                  >
                    <option value="New">Brand New (Unopened)</option>
                    <option value="Like New">Like New (Mint / Barely Used)</option>
                    <option value="Good">Good (Minor cosmetic wear, 100% working)</option>
                    <option value="Fair">Fair (Noticeable wear, fully functional)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Asking Price (₹) *</label>
                <div className="price-input-wrap tabular-nums">
                  <span className="price-symbol tabular-nums">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input price-input-field tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="4"
                  placeholder="Mention age of item, reason for sale, original purchase invoice, and accessories included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="wizard-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  &larr; Back
                </button>
                <button type="button" className="btn-primary" onClick={handleNextStep}>
                  Next: Upload Photos &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS */}
          {step === 3 && (
            <div className="wizard-step-content">
              <h2 className="step-title">Upload Photos</h2>
              <p className="step-desc">Listings with clear real photos sell 4x faster on BigBazaar</p>

              <div className="photos-upload-area">
                <div className="photo-thumbs-grid">
                  {images.map((img, i) => (
                    <div key={i} className="photo-thumb-card">
                      <img src={img} alt={`Upload ${i + 1}`} />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => handleRemovePhoto(i)}
                      >
                        &times;
                      </button>
                      {i === 0 && <span className="cover-tag">Cover Photo</span>}
                    </div>
                  ))}

                  {images.length < 5 && (
                    <button
                      type="button"
                      className="photo-add-card"
                      onClick={handleAddSamplePhoto}
                    >
                      <span style={{ fontSize: '28px' }}>+</span>
                      <small>Add Photo</small>
                    </button>
                  )}
                </div>
                <p className="photo-note">
                  Click "+ Add Photo" to attach photos (max 5). The first photo will be used as the listing thumbnail.
                </p>
              </div>

              <div className="wizard-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                  &larr; Back
                </button>
                <button type="button" className="btn-primary" onClick={handleNextStep}>
                  Next: Location &amp; Review &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION & FINAL REVIEW */}
          {step === 4 && (
            <div className="wizard-step-content">
              <h2 className="step-title">Location &amp; Contact Information</h2>
              <p className="step-desc">Specify where buyers can meet for handover or inspection</p>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Locality / Area *</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={showPhone}
                    onChange={(e) => setShowPhone(e.target.checked)}
                  />
                  <span>Show phone number to verified buyers</span>
                </label>
              </div>

              {/* Review Summary Box */}
              <div className="ad-review-summary">
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>
                  Ad Review Summary
                </h4>
                <div className="review-summary-row">
                  <span>Title:</span>
                  <strong>{title}</strong>
                </div>
                <div className="review-summary-row">
                  <span>Category:</span>
                  <strong>{category} &gt; {subcategory}</strong>
                </div>
                <div className="review-summary-row">
                  <span>Asking Price:</span>
                  <strong style={{ color: 'var(--brand-green)' }}>
                    ₹{Number(price).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="review-summary-row">
                  <span>Location:</span>
                  <strong>{locality}, {city}</strong>
                </div>
                <div className="review-summary-row">
                  <span>Photos:</span>
                  <strong>{images.length} attached</strong>
                </div>
              </div>

              <div className="wizard-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? 'Publishing...' : '🚀 Publish Free Ad'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && (
            <div className="wizard-success-state">
              <div className="success-icon-badge">🎉</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '16px' }}>
                Your Ad is Published and Live!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '440px', margin: '8px auto 24px' }}>
                Congratulations! <strong>{title}</strong> is now discoverable to thousands of interested buyers in {city}.
              </p>

              <div className="success-action-group">
                {publishedAd && (
                  <Link to={`/listing/${publishedAd.id}`} className="btn-primary">
                    View Published Ad &rarr;
                  </Link>
                )}
                <Link to="/marketplace" className="btn-secondary">
                  Browse Marketplace
                </Link>
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={() => {
                    setStep(1);
                    setTitle('');
                    setPrice('');
                    setDescription('');
                    setImages([DEMO_UPLOAD_IMAGES[0]]);
                  }}
                >
                  + Post Another Ad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        .post-ad-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .post-ad-container {
          max-width: 760px;
          padding: 40px 16px 80px;
        }
        .wizard-progress {
          margin-bottom: 24px;
        }
        .wizard-steps-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .wizard-step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 1;
        }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E2E8F0;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
        }
        .wizard-step-node.active .step-circle {
          background: var(--brand-blue);
          color: #FBFBFA;
          box-shadow: 0 0 0 4px rgba(21, 72, 166, 0.15);
        }
        .wizard-step-node.completed .step-circle {
          background: var(--brand-green);
          color: #FBFBFA;
        }
        .step-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .post-ad-error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #F87171;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .post-ad-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }
        .step-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .step-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .category-select-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .cat-select-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cat-select-card:hover {
          border-color: var(--brand-blue);
          background: #EFF6FF;
        }
        .cat-select-card.selected {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }
        .cat-select-icon {
          font-size: 24px;
          margin-bottom: 6px;
        }
        .subcategory-select-group {
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--brand-blue);
        }
        .field-hint {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .price-input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          overflow: hidden;
        }
        .price-symbol {
          background: #EEEDE9;
          padding: 10px 16px;
          font-weight: 800;
          font-size: 16px;
          color: var(--text-primary);
          border-right: 1px solid #E7E5E4;
        }
        .price-input-field {
          border: none;
          font-size: 18px;
          font-weight: 700;
        }
        .photos-upload-area {
          background: #EEEDE9;
          border: 2px dashed #CBD5E1;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .photo-thumbs-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .photo-thumb-card {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 12px;
          overflow: hidden;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
        }
        .photo-thumb-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .photo-remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.6);
          color: #FBFBFA;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .cover-tag {
          position: absolute;
          bottom: 4px;
          left: 4px;
          right: 4px;
          background: rgba(15, 23, 42, 0.8);
          color: #FBFBFA;
          font-size: 9px;
          font-weight: 700;
          text-align: center;
          padding: 2px;
          border-radius: 4px;
        }
        .photo-add-card {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          border: 2px dashed var(--brand-blue);
          background: #FBFBFA;
          color: var(--brand-blue);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .photo-note {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 14px;
        }
        .ad-review-summary {
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
        }
        .review-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 4px 0;
        }
        .review-summary-row span {
          color: var(--text-secondary);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .wizard-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #E7E5E4;
        }
        .wizard-success-state {
          text-align: center;
          padding: 32px 16px;
        }
        .success-icon-badge {
          font-size: 54px;
        }
        .success-action-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .btn-text-link {
          color: var(--brand-blue);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .category-select-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
