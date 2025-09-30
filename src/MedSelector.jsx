import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
// Remove ToastContainer and toast imports as we are moving to paragraph messages
// import { ToastContainer, toast } from "react-toastify"; 
// import "react-toastify/dist/ReactToastify.css";

// ----------------------------------------------------------------------
// 1. STYLING CONSTANTS (For a consistent medical/clean look)
// ----------------------------------------------------------------------
const COLORS = {
  primary: "#007BFF",     // Blue for actions/buttons
  secondary: "#28A745",   // Green for safe/success
  danger: "#DC3545",      // Red for critical interactions
  warning: "#FFC107",     // Yellow for moderate interactions
  background: "#F8F9FA",  // Light gray background
  card: "#FFFFFF",        // White card background
  text: "#343A40",        // Dark text
};

const SEVERITY_MAP = {
  danger: {
    color: COLORS.danger,
    backgroundColor: "#FADBD8", // Very light red
    icon: "⚠️ Severe Risk:",
  },
  moderate: {
    color: COLORS.warning,
    backgroundColor: "#FCF3CF", // Very light yellow
    icon: "⚡ Moderate Risk:",
  },
  safe: {
    color: COLORS.secondary,
    backgroundColor: "#D4EFDF", // Very light green
    icon: "✅ Safe:",
  },
};

// ----------------------------------------------------------------------
// 2. EXPANDED BASE OPTIONS
// ----------------------------------------------------------------------
const baseMeds = [
  "Aspirin",
  "Ibuprofen",
  "Paracetamol (Acetaminophen)",
  "Amoxicillin",
  "Metformin",
  "Atorvastatin",
  "Omeprazole",
  "Losartan",
  "Ciprofloxacin",
  "Prednisone",
  "Levothyroxine",
  "Gabapentin",
  "Amlodipine",
  "Lisinopril",
  "Hydrochlorothiazide",
].map((name) => ({ value: name, label: name }));

// ----------------------------------------------------------------------
// 3. REACT-SELECT CUSTOM STYLES
// ----------------------------------------------------------------------
const selectStyles = {
  control: (styles) => ({ 
    ...styles, 
    borderColor: COLORS.primary, 
    boxShadow: 'none',
    '&:hover': {
        borderColor: COLORS.primary,
    }
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? COLORS.primary : isFocused ? COLORS.background : COLORS.card,
    color: isSelected ? COLORS.card : COLORS.text,
    '&:active': {
        backgroundColor: COLORS.primary,
    }
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: COLORS.primary,
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: COLORS.card,
  }),
};


// ----------------------------------------------------------------------
// 4. MAIN COMPONENT
// ----------------------------------------------------------------------

const MedSelector = () => {
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // NEW STATE: To hold the main status message and its style type
  const [status, setStatus] = useState({ message: '', type: 'info' });

  const handleCheckInteractions = async () => {
    
    setStatus({ message: '', type: 'info' }); // Clear previous status
    
    if (selectedMeds.length === 0) {
      // Replaced toast.warning with setStatus
      setStatus({ message: "Please select at least one medication! 💊", type: 'warning' });
      return;
    }

    setResults([]);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5678/webhook-test/drug-interactions",
        { meds: selectedMeds.map((med) => med.value) },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("n8n response:", response.data);

      let newResults = [];
      
      // --- ROBUST DATA PARSING ---
      if (Array.isArray(response.data)) {
        newResults = response.data;
      } else if (response.data.interactions && Array.isArray(response.data.interactions)) {
        newResults = response.data.interactions;
      } else if (response.data.content) {
        try {
            const cleaned = response.data.content.replace(/```json|```/g, "").trim();
            newResults = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse complex JSON result:", e);
            // Replaced toast.error with setStatus
            setStatus({ message: "Failed to parse complex JSON result from server.", type: 'danger' });
            newResults = [];
        }
      }
      
      setResults(newResults);

      // --- IMPROVED STATUS MESSAGE LOGIC (Replaces Toast Logic) ---
      if (newResults.length === 0 && selectedMeds.length > 0) {
          // Replaced toast.info with setStatus
          setStatus({ message: "No interaction data was returned from the server for this request. Check n8n logs. 🔌", type: 'warning' });
      } else if (newResults.length > 0) {
          const hasRisk = newResults.some(item => 
              item.severity?.toLowerCase() === 'danger' || item.severity?.toLowerCase() === 'moderate'
          );
          if (hasRisk) {
              // Replaced toast.error with setStatus
              setStatus({ message: "⚠️ Critical: Interactions found! Review the detailed results below.", type: 'danger' });
          } else {
              // Replaced toast.success with setStatus
              setStatus({ message: "✅ All checked combinations appear safe.", type: 'secondary' });
          }
      }
      
    } catch (error) {
        let errorMessage = "Request setup error.";
        if (error.response) {
            errorMessage = `Backend error: ${error.response.data.message || "Unknown"}`;
        } else if (error.request) {
            errorMessage = "No response from backend. Check if n8n is running. 🔌";
        }
        // Replaced toast.error with setStatus
        setStatus({ message: errorMessage, type: 'danger' });
    }

    setLoading(false);
  };

  const getStatusStyle = (type) => {
      const colorMap = {
          secondary: { background: SEVERITY_MAP.safe.backgroundColor, color: COLORS.secondary },
          danger: { background: SEVERITY_MAP.danger.backgroundColor, color: COLORS.danger },
          warning: { background: SEVERITY_MAP.moderate.backgroundColor, color: COLORS.warning },
          info: { background: '#E9ECEF', color: COLORS.text } // Neutral info
      };
      return {
          padding: '1rem',
          marginTop: '1.5rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          ...colorMap[type]
      };
  };

  return (
    <div 
        style={{ 
            maxWidth: "700px", 
            margin: "40px auto", 
            padding: "30px",
            backgroundColor: COLORS.background,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            fontFamily: "Arial, sans-serif" 
        }}
    >
      <h2 style={{ 
            color: COLORS.primary, 
            textAlign: "center", 
            marginBottom: "2rem",
            borderBottom: `2px solid ${COLORS.primary}`,
            paddingBottom: '10px'
        }}>
        Drug Interaction Scanner 🔬
      </h2>

      <p style={{ color: COLORS.text, marginBottom: "1rem", fontSize: '0.9rem' }}>
        Search, select, or **type** (and press enter/tab) to add your medications.
      </p>

      {/* CreatableSelect allows typing and adding custom items */}
      <CreatableSelect
        options={baseMeds}
        isMulti
        onChange={setSelectedMeds}
        value={selectedMeds}
        placeholder="Search or type medication names..."
        styles={selectStyles}
      />

      <button
        onClick={handleCheckInteractions}
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          width: "100%",
          cursor: "pointer",
          backgroundColor: COLORS.primary,
          color: COLORS.card,
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          transition: "background-color 0.2s",
        }}
        disabled={loading}
      >
        {loading ? "Analyzing Interactions..." : "CHECK INTERACTIONS"}
      </button>

      {/* --- STATUS PARAGRAPH SECTION (Replaces Toast) --- */}
      {status.message && (
          <div style={getStatusStyle(status.type)}>
              {status.message}
          </div>
      )}
      
      {/* Remove ToastContainer entirely */}
      {/* <ToastContainer position="bottom-right" /> */} 

      {/* --- RESULTS SECTION --- */}
      {results.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <h3 style={{ color: COLORS.text, borderBottom: `1px solid #ccc`, paddingBottom: '5px' }}>
            Scan Results ({results.length})
          </h3>
          {results.map((item, index) => {
            // Default to 'safe' if severity is missing or invalid
            const severityKey = item.severity?.toLowerCase() in SEVERITY_MAP ? item.severity.toLowerCase() : 'safe';
            const { color, backgroundColor, icon } = SEVERITY_MAP[severityKey];
            
            // Check if drug1 or drug2 exist (handles potential single-drug lookup logic if implemented)
            if (!item.drug1 && !item.drug2 && !item.drug) return null; 

            // Logic to handle single-drug info (if your n8n implements it)
            const title = item.drug2 
                ? `${item.drug1} + ${item.drug2}` 
                : `${item.drug} Information`;

            return (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  marginBottom: "1rem",
                  borderRadius: "8px",
                  backgroundColor: COLORS.card,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: `6px solid ${color}`, // Highlight bar
                  transition: "transform 0.1s"
                }}
              >
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: COLORS.text }}>
                    {title}
                </p>
                
                {/* Only show the severity box for actual interaction checks */}
                {item.drug2 && (
                    <div style={{ 
                        marginTop: "0.5rem", 
                        marginBottom: '0.5rem',
                        padding: '8px', 
                        borderRadius: '4px',
                        backgroundColor: backgroundColor,
                        color: color,
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                    }}>
                        {icon} {item.severity?.toUpperCase() || "SAFE"}
                    </div>
                )}
                
                <p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.9rem", color: COLORS.text }}>
                  **Message:** {item.message || "No specific detailed warning provided."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedSelector;