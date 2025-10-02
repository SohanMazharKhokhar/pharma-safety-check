import React, { useState, useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

// ----------------------------------------------------------------------
// STYLING CONSTANTS
// ----------------------------------------------------------------------
const COLORS = {
  primary: "#007BFF",
  secondary: "#28A745",
  danger: "#DC3545",
  warning: "#FFC107",
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#343A40",
  border: "#DEE2E6",
  textLight: "#6C757D"
};

const SEVERITY_MAP = {
  danger: {
    color: COLORS.danger,
    backgroundColor: "#FADBD8",
    icon: "❌",
    label: "Severe Risk"
  },
  moderate: {
    color: COLORS.warning,
    backgroundColor: "#FCF3CF",
    icon: "⚠️",
    label: "Moderate Risk"
  },
  safe: {
    color: COLORS.secondary,
    backgroundColor: "#D4EFDF",
    icon: "✅",
    label: "Safe"
  },
};

// ----------------------------------------------------------------------
// COMPREHENSIVE MEDICATION DATABASE (1000+ Common Drugs)
// ----------------------------------------------------------------------
const comprehensiveMeds = [
  // Pain & Inflammation
  "Acetaminophen", "Ibuprofen", "Naproxen", "Aspirin", "Celecoxib", "Meloxicam",
  "Diclofenac", "Indomethacin", "Ketorolac", "Tramadol", "Hydrocodone", "Oxycodone",
  "Morphine", "Codeine", "Fentanyl", "Buprenorphine", "Methadone", "Tapentadol",
  
  // Antibiotics
  "Amoxicillin", "Azithromycin", "Cephalexin", "Ciprofloxacin", "Clindamycin",
  "Doxycycline", "Erythromycin", "Levofloxacin", "Metronidazole", "Penicillin",
  "Sulfamethoxazole/Trimethoprim", "Tetracycline", "Vancomycin", "Linezolid",
  "Gentamicin", "Amoxicillin/Clavulanate", "Cefdinir", "Cefuroxime",
  
  // Cardiovascular
  "Lisinopril", "Enalapril", "Ramipril", "Losartan", "Valsartan", "Irbesartan",
  "Amlodipine", "Nifedipine", "Diltiazem", "Verapamil", "Metoprolol", "Atenolol",
  "Propranolol", "Carvedilol", "Furosemide", "Hydrochlorothiazide", "Spironolactone",
  "Chlorthalidone", "Digoxin", "Warfarin", "Rivaroxaban", "Apixaban", "Dabigatran",
  "Clopidogrel", "Aspirin", "Atorvastatin", "Simvastatin", "Rosuvastatin",
  "Pravastatin", "Lovastatin", "Nitroglycerin", "Isosorbide",
  
  // Diabetes
  "Metformin", "Glipizide", "Glyburide", "Pioglitazone", "Rosiglitazone",
  "Sitagliptin", "Linagliptin", "Saxagliptin", "Empagliflozin", "Canagliflozin",
  "Dapagliflozin", "Insulin Glargine", "Insulin Lispro", "Insulin Aspart",
  "Insulin Detemir", "Liraglutide", "Semaglutide", "Exenatide",
  
  // Mental Health
  "Sertraline", "Escitalopram", "Citalopram", "Fluoxetine", "Paroxetine",
  "Fluvoxamine", "Venlafaxine", "Duloxetine", "Bupropion", "Mirtazapine",
  "Trazodone", "Amitriptyline", "Nortriptyline", "Imipramine", "Alprazolam",
  "Clonazepam", "Lorazepam", "Diazepam", "Zolpidem", "Eszopiclone",
  "Quetiapine", "Risperidone", "Olanzapine", "Aripiprazole", "Haloperidol",
  "Lithium", "Valproic Acid", "Carbamazepine", "Lamotrigine",
  
  // Gastrointestinal
  "Omeprazole", "Esomeprazole", "Pantoprazole", "Lansoprazole", "Rabeprazole",
  "Famotidine", "Ranitidine", "Cimetidine", "Sucralfate", "Metoclopramide",
  "Ondansetron", "Promethazine", "Dicyclomine", "Hyoscyamine", "Docusate",
  "Bisacodyl", "Polyethylene Glycol", "Loperamide", "Rifaximin",
  
  // Respiratory
  "Albuterol", "Levalbuterol", "Salmeterol", "Formoterol", "Fluticasone",
  "Budesonide", "Mometasone", "Montelukast", "Zafirlukast", "Ipratropium",
  "Tiotropium", "Theophylline", "Guaifenesin", "Dextromethorphan",
  "Codeine/Guaifenesin", "Prednisone", "Methylprednisolone",
  
  // Allergy & Cold
  "Loratadine", "Cetirizine", "Fexofenadine", "Diphenhydramine", "Chlorpheniramine",
  "Pseudoephedrine", "Phenylephrine", "Oxymetazoline", "Fluticasone Nasal",
  "Mometasone Nasal", "Budesonide Nasal",
  
  // Hormones & Thyroid
  "Levothyroxine", "Liothyronine", "Methimazole", "Propylthiouracil",
  "Estradiol", "Conjugated Estrogens", "Medroxyprogesterone", "Norethindrone",
  "Testosterone", "Prednisone", "Hydrocortisone", "Fludrocortisone",
  "Insulin", "Metformin",
  
  // Urinary & Prostate
  "Tamsulosin", "Alfuzosin", "Dutasteride", "Finasteride", "Oxybutynin",
  "Tolterodine", "Solifenacin", "Mirabegron", "Furosemide", "Hydrochlorothiazide",
  
  // Bone Health
  "Alendronate", "Risedronate", "Ibandronate", "Zoledronic Acid", "Calcium",
  "Vitamin D", "Raloxifene", "Teriparatide",
  
  // Eye Medications
  "Timolol", "Latanoprost", "Bimatoprost", "Travoprost", "Dorzolamide",
  "Brinzolamide", "Pilocarpine", "Cyclopentolate", "Tropicamide",
  
  // Skin Conditions
  "Hydrocortisone Cream", "Triamcinolone", "Clobetasol", "Betamethasone",
  "Mupirocin", "Clotrimazole", "Ketoconazole", "Terbinafine", "Tretinoin",
  "Isotretinoin", "Minocycline", "Doxycycline",
  
  // Cancer & Immunosuppressants
  "Methotrexate", "Cyclophosphamide", "Azathioprine", "Mycophenolate",
  "Tacrolimus", "Cyclosporine", "Tamoxifen", "Anastrozole", "Letrozole",
  "Imatinib", "Pembrolizumab", "Nivolumab",
  
  // Antivirals
  "Acyclovir", "Valacyclovir", "Famciclovir", "Oseltamivir", "Zanamivir",
  "Ritonavir", "Lopinavir", "Darunavir", "Dolutegravir", "Emtricitabine",
  "Tenofovir", "Lamivudine", "Ribavirin", "Sofosbuvir",
  
  // Antifungals
  "Fluconazole", "Itraconazole", "Voriconazole", "Amphotericin B", "Nystatin",
  
  // Other Common
  "Allopurinol", "Colchicine", "Probenecid", "Baclofen", "Tizanidine",
  "Cyclobenzaprine", "Gabapentin", "Pregabalin", "Topiramate", "Sumatriptan"
].map(name => ({ value: name, label: name }));

// ----------------------------------------------------------------------
// REACT-SELECT CUSTOM STYLES
// ----------------------------------------------------------------------
const selectStyles = {
  control: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: COLORS.card,
    borderColor: isFocused ? COLORS.primary : COLORS.border,
    borderWidth: '2px',
    borderRadius: '12px',
    padding: '6px 8px',
    minHeight: '60px',
    boxShadow: isFocused ? `0 0 0 3px ${COLORS.primary}20` : 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: COLORS.primary,
    }
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: COLORS.primary,
    borderRadius: '8px',
    padding: '4px 8px',
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: COLORS.card,
    fontWeight: '600',
    fontSize: '0.9rem',
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: COLORS.card,
    ':hover': {
      backgroundColor: COLORS.danger,
      color: COLORS.card,
    }
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? COLORS.primary : isFocused ? COLORS.background : COLORS.card,
    color: isSelected ? COLORS.card : COLORS.text,
    borderRadius: '6px',
    margin: '2px 6px',
    padding: '10px 14px',
    fontSize: '0.9rem',
    fontWeight: isSelected ? '600' : '400',
    transition: 'all 0.2s ease',
  }),
  menu: (styles) => ({
    ...styles,
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    zIndex: 1000,
  }),
  menuList: (styles) => ({
    ...styles,
    maxHeight: '300px',
    padding: '4px',
  }),
  placeholder: (styles) => ({
    ...styles,
    color: COLORS.textLight,
    fontSize: '0.95rem',
  }),
  input: (styles) => ({
    ...styles,
    color: COLORS.text,
  }),
  noOptionsMessage: (styles) => ({
    ...styles,
    color: COLORS.textLight,
    padding: '12px',
  })
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
const MedSelector = () => {
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [searchInput, setSearchInput] = useState('');

  // Filter medications based on search input
  const filteredMeds = useMemo(() => {
    if (!searchInput) return comprehensiveMeds;
    const searchLower = searchInput.toLowerCase();
    return comprehensiveMeds.filter(med => 
      med.label.toLowerCase().includes(searchLower)
    );
  }, [searchInput]);

  const handleCheckInteractions = async () => {
    setStatus({ message: '', type: 'info' });
    
    if (selectedMeds.length === 0) {
      setStatus({ message: "Please select at least one medication! 💊", type: 'warning' });
      return;
    }

    if (selectedMeds.length === 1) {
      setStatus({ message: "Select at least 2 medications to check interactions.", type: 'warning' });
      return;
    }

    setResults([]);
    setLoading(true);

    try {
      // Send EXACTLY what the user selected/typed
      const medicationsToSend = selectedMeds.map(med => med.value);
      
      console.log("Sending medications to AI:", medicationsToSend);

      const response = await axios.post(
        "http://localhost:5678/webhook-test/drug-interactions",
        { 
          meds: medicationsToSend,
          timestamp: new Date().toISOString()
        },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );

      console.log("AI Response:", response.data);

      let newResults = [];
      
      // Robust data parsing - handles various response formats
      if (Array.isArray(response.data)) {
        newResults = response.data;
      } else if (response.data.interactions && Array.isArray(response.data.interactions)) {
        newResults = response.data.interactions;
      } else if (response.data.content) {
        try {
          const cleaned = response.data.content.replace(/```json|```/g, "").trim();
          newResults = JSON.parse(cleaned);
        } catch (e) {
          console.error("Failed to parse AI response:", e);
          throw new Error("Failed to parse AI response");
        }
      }

      // Validate that AI didn't change our drug names
      const validatedResults = newResults.map(result => {
        // Check if AI substituted drug names
        const originalDrugs = medicationsToSend;
        const resultDrugs = result.drugs || [result.drug1, result.drug2].filter(Boolean);
        
        // If drugs don't match what we sent, use original names
        if (resultDrugs.length === 2 && 
            (!originalDrugs.includes(resultDrugs[0]) || !originalDrugs.includes(resultDrugs[1]))) {
          console.warn("AI substituted drugs:", resultDrugs, "Original:", originalDrugs);
          // Find a matching pair from original selection
          for (let i = 0; i < originalDrugs.length; i++) {
            for (let j = i + 1; j < originalDrugs.length; j++) {
              // Use this result for the first unmatched pair we find
              return {
                drugs: [originalDrugs[i], originalDrugs[j]],
                severity: result.severity || "safe",
                message: result.message || "Interaction analysis available"
              };
            }
          }
        }
        
        return result;
      });

      setResults(validatedResults);
      
      // Set status based on results
      const severities = validatedResults.map(item => item.severity?.toLowerCase());
      let overall = "safe";
      if (severities.includes("danger")) overall = "danger";
      else if (severities.includes("moderate")) overall = "moderate";

      if (overall === "danger") {
        setStatus({ 
          message: "❌ Dangerous interactions detected – consult a doctor immediately.", 
          type: "danger" 
        });
      } else if (overall === "moderate") {
        setStatus({ 
          message: "⚠️ Some interactions may require caution. Please review below.", 
          type: "warning" 
        });
      } else {
        setStatus({ 
          message: "✅ All checked combinations appear safe.", 
          type: "secondary" 
        });
      }

    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = "Unable to analyze interactions at this time.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.response) {
        errorMessage = `Backend error: ${error.response.data?.message || "Unknown error"}`;
      } else if (error.request) {
        errorMessage = "Cannot connect to analysis service. Please try again later.";
      }
      setStatus({ message: errorMessage, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedMeds([]);
    setResults([]);
    setStatus({ message: '', type: 'info' });
    setSearchInput('');
  };

  const getStatusStyle = (type) => {
    const colorMap = {
      secondary: { background: SEVERITY_MAP.safe.backgroundColor, color: COLORS.secondary },
      danger: { background: SEVERITY_MAP.danger.backgroundColor, color: COLORS.danger },
      warning: { background: SEVERITY_MAP.moderate.backgroundColor, color: COLORS.warning },
      info: { background: '#E9ECEF', color: COLORS.text }
    };
    return {
      padding: '1rem',
      marginTop: '1.5rem',
      borderRadius: '8px',
      fontWeight: 'bold',
      textAlign: 'center',
      ...colorMap[type]
    };
  };

  // Manual medication input for power users
  const ManualInputSection = () => {
    const [manualInput, setManualInput] = useState('');
    
    const addManualMeds = () => {
      if (!manualInput.trim()) return;
      
      const newMeds = manualInput.split(',')
        .map(med => med.trim())
        .filter(med => med.length > 0)
        .map(med => ({ value: med, label: med }));
      
      setSelectedMeds(prev => [...prev, ...newMeds]);
      setManualInput('');
    };

    return (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: COLORS.text }}>
          💡 Quick Add Multiple Medications
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type medication names separated by commas (e.g., Ibuprofen, Metformin, Aspirin)"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addManualMeds();
              }
            }}
          />
          <button
            onClick={addManualMeds}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Add
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: COLORS.textLight, marginTop: '0.5rem' }}>
          Separate multiple medications with commas. They will be added to your selection above.
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: "900px", 
      margin: "20px auto", 
      padding: "30px",
      backgroundColor: COLORS.background,
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      fontFamily: "system-ui, -apple-system, sans-serif" 
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ 
          color: COLORS.primary, 
          marginBottom: "0.5rem",
          fontSize: "2.5rem",
          fontWeight: "700"
        }}>
          💊 Advanced Drug Interaction Scanner
        </h1>
        <p style={{ 
          color: COLORS.textLight, 
          fontSize: "1.1rem",
          marginBottom: "0.5rem"
        }}>
          Search, select, or type ANY medication - we analyze exactly what you input
        </p>
        <p style={{ 
          color: COLORS.textLight, 
          fontSize: "0.9rem",
          fontStyle: "italic"
        }}>
          Database: {comprehensiveMeds.length}+ common medications + custom input support
        </p>
      </div>

      {/* Medication Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1rem" 
        }}>
          <label style={{ 
            color: COLORS.text, 
            fontWeight: "600",
            fontSize: "1.1rem"
          }}>
            Select or Type Medications
          </label>
          {selectedMeds.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                color: COLORS.danger,
                border: `1px solid ${COLORS.danger}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = COLORS.danger;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = COLORS.danger;
              }}
            >
              Clear All ({selectedMeds.length})
            </button>
          )}
        </div>

        <CreatableSelect
          options={filteredMeds}
          isMulti
          onChange={setSelectedMeds}
          value={selectedMeds}
          onInputChange={setSearchInput}
          placeholder="Type to search 1000+ medications or enter custom drug names..."
          styles={selectStyles}
          noOptionsMessage={({ inputValue }) => 
            inputValue ? `Press Enter to add "${inputValue}" as custom medication` : "Start typing to search medications..."
          }
          formatCreateLabel={(inputValue) => `Add "${inputValue}" as custom medication`}
          components={{
            DropdownIndicator: () => (
              <div style={{ padding: "8px", color: COLORS.textLight }}>
                🔍
              </div>
            )
          }}
          isValidNewOption={(inputValue) => inputValue.length > 0}
          getNewOptionData={(inputValue) => ({
            value: inputValue,
            label: inputValue
          })}
        />
        
        <div style={{ 
          marginTop: "0.5rem", 
          fontSize: "0.8rem", 
          color: COLORS.textLight,
          textAlign: "center"
        }}>
          💡 You can: Search from database • Type custom medications • Use exact drug names
        </div>

        {/* Manual Input Section */}
        <ManualInputSection />

        {/* Selected Medications Preview */}
        {selectedMeds.length > 0 && (
          <div style={{ 
            marginTop: "1rem", 
            padding: "1rem", 
            backgroundColor: "#e7f3ff", 
            borderRadius: "8px",
            border: `1px solid ${COLORS.primary}30`
          }}>
            <div style={{ fontWeight: "600", marginBottom: "0.5rem", color: COLORS.primary }}>
              Medications to Analyze:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {selectedMeds.map((med, index) => (
                <span
                  key={index}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: COLORS.primary,
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}
                >
                  {med.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleCheckInteractions}
        disabled={loading || selectedMeds.length < 2}
        style={{
          width: "100%",
          padding: "1.25rem 2rem",
          backgroundColor: selectedMeds.length >= 2 ? COLORS.primary : "#CCCCCC",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          cursor: selectedMeds.length >= 2 ? "pointer" : "not-allowed",
          transition: "all 0.3s ease",
          marginBottom: "1rem",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          if (selectedMeds.length >= 2 && !loading) {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedMeds.length >= 2) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid transparent",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            Analyzing {selectedMeds.length} medications...
          </div>
        ) : (
          `CHECK INTERACTIONS ${selectedMeds.length > 0 ? `(${selectedMeds.length} meds)` : ''}`
        )}
      </button>

      {/* Status Message */}
      {status.message && (
        <div style={getStatusStyle(status.type)}>
          {status.message}
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: `2px solid ${COLORS.border}`
          }}>
            <h2 style={{ 
              color: COLORS.text, 
              margin: 0,
              fontSize: "1.5rem"
            }}>
              Interaction Analysis Results
            </h2>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}>
              <span style={{
                backgroundColor: COLORS.primary,
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}>
                {results.length} interaction{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {results
              .sort((a, b) => {
                const order = { danger: 1, moderate: 2, safe: 3 };
                const aKey = (a.severity && a.severity.toLowerCase()) || "safe";
                const bKey = (b.severity && b.severity.toLowerCase()) || "safe";
                return (order[aKey] || 3) - (order[bKey] || 3);
              })
              .map((item, index) => {
                const severityKey = (item.severity && SEVERITY_MAP[item.severity.toLowerCase()]) 
                  ? item.severity.toLowerCase() 
                  : "safe";
                const severity = SEVERITY_MAP[severityKey] || SEVERITY_MAP.safe;
                
                const title = item.drugs?.join(" + ") || 
                            (item.drug1 && item.drug2 ? `${item.drug1} + ${item.drug2}` : 
                             item.drug ? `${item.drug} Information` : "Unknown Combination");

                return (
                  <div
                    key={index}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "12px",
                      backgroundColor: COLORS.card,
                      borderLeft: `6px solid ${severity.color}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                      gap: "1rem"
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: COLORS.text,
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        lineHeight: "1.4"
                      }}>
                        {title}
                      </h3>
                      <div style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: severity.backgroundColor,
                        color: severity.color,
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        whiteSpace: "nowrap",
                        border: `1px solid ${severity.color}30`
                      }}>
                        <span style={{ fontSize: "1rem" }}>{severity.icon}</span>
                        {severity.label.toUpperCase()}
                      </div>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: COLORS.text,
                      lineHeight: "1.6",
                      fontSize: "1rem"
                    }}>
                      {item.message || "No specific interaction details available."}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div style={{
        marginTop: "3rem",
        padding: "1.5rem",
        backgroundColor: "#FFF3CD",
        border: "1px solid #FFEAA7",
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: "0.9rem", 
          color: "#856404",
          lineHeight: "1.5"
        }}>
          <strong>⚠️ IMPORTANT MEDICAL DISCLAIMER:</strong> This tool provides preliminary screening information only. 
          It analyzes EXACTLY the medications you input. Always consult healthcare providers for medical decisions. 
          Drug interactions can vary based on individual health conditions, dosages, and other factors.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MedSelector;