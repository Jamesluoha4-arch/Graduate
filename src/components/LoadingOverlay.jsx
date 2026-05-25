const steps = [
  "Scanning facial features...",
  "Creating Q-version graduation avatar...",
  "Placing avatar into the USYD scene...",
];

export default function LoadingOverlay({ activeStep = 0 }) {
  return (
    <div className="loading-backdrop">
      <div className="loading-card glass-panel">
        <div className="scan-orb">
          <span />
        </div>
        <h2>Generating your graduation avatar</h2>
        <div className="scan-steps">
          {steps.map((step, index) => (
            <div key={step} className={index <= activeStep ? "active" : ""}>
              <span>{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
