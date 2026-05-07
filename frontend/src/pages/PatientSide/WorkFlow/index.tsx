import React from "react";
import {
  FileText,
  ShieldCheck,
  Briefcase,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./WorkFlow.css";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: "completed" | "current" | "pending";
}

const WorkFlow: React.FC = () => {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 1,
      title: "Health Questionnaire",
      description: "Fill in your basic health details and lifestyle habits.",
      icon: <FileText className="w-6 h-6" />,
      path: "/patient/questionnaire",
      status: "current",
    },
    {
      id: 2,
      title: "Medical Reports",
      description: "Upload your latest medical and blood test reports.",
      icon: <FileText className="w-6 h-6" />,
      path: "/patient/health-reports",
      status: "pending",
    },
    {
      id: 3,
      title: "Plan Selection & Approval",
      description: "Review, approve, and complete payment for your personalized diet plans.",
      icon: <Briefcase className="w-6 h-6" />,
      path: "/patient/suggested-plans",
      status: "pending",
    },
    {
      id: 4,
      title: "Miisky Verification",
      description: "Final verification and activation by the Miisky team.",
      icon: <ShieldCheck className="w-6 h-6" />,
      path: "/patient/suggested-plans",
      status: "pending",
    },
    {
      id: 5,
      title: "Daily Meal Setup",
      description: "Your nutritionist sets your daily meal schedules.",
      icon: <CheckCircle className="w-6 h-6" />,
      path: "/patient/meals-allotted",
      status: "pending",
    },
  ];

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>Your Miisky Journey</h1>
        <p>Follow these steps to get your personalized health and nutrition plan.</p>
      </div>

      <div className="workflow-grid">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`workflow-card ${step.status}`}
            onClick={() => navigate(step.path)}
          >
            <div className="card-content">
              <div className="icon-wrapper">
                {step.icon}
                <div className="step-number">{step.id}</div>
              </div>
              <div className="text-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className="action-arrow">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="connector-line"></div>
            )}
          </div>
        ))}
      </div>

      <div className="workflow-footer">
        <div className="status-legend">
          <div className="legend-item">
            <span className="dot current"></span>
            <span>Active Step</span>
          </div>
          <div className="legend-item">
            <span className="dot pending"></span>
            <span>Next Steps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkFlow;
