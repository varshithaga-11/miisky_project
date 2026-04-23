import React from "react";
import { 
  Users, 
  FileText, 
  ClipboardList, 
  Briefcase, 
  CheckCircle2, 
  Layers, 
  Video,
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

const NutritionWorkFlow: React.FC = () => {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 1,
      title: "Patient Mapping",
      description: "Review and manage your assigned patients.",
      icon: <Users className="w-6 h-6" />,
      path: "/nutrition/nutrition-mapping/user-mapping",
      status: "current",
    },
    {
      id: 2,
      title: "Questionnaire Review",
      description: "Analyze patient health conditions and lifestyle habits.",
      icon: <FileText className="w-6 h-6" />,
      path: "/nutrition/questionnaire",
      status: "pending",
    },
    {
      id: 3,
      title: "Medical Documents",
      description: "Review uploaded medical and blood test reports.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/nutrition/uploaded-documents",
      status: "pending",
    },
    {
      id: 4,
      title: "Diet Plan Suggestion",
      description: "Suggest personalized diet plans and micro-kitchens.",
      icon: <Briefcase className="w-6 h-6" />,
      path: "/nutrition/suggest-plan",
      status: "pending",
    },
    {
      id: 5,
      title: "Approved Plans",
      description: "Monitor plans that have been approved by patients.",
      icon: <CheckCircle2 className="w-6 h-6" />,
      path: "/nutrition/approved-plans",
      status: "pending",
    },
    {
      id: 6,
      title: "Daily Meal Setup",
      description: "Configure and optimize daily meal schedules.",
      icon: <Layers className="w-6 h-6" />,
      path: "/nutrition/set-meals",
      status: "pending",
    },
    {
      id: 7,
      title: "Engagement Hub",
      description: "Manage consultations and meeting requests.",
      icon: <Video className="w-6 h-6" />,
      path: "/nutrition/meeting-requests",
      status: "pending",
    },
  ];

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>Nutritionist Workflow</h1>
        <p>Expertly manage your patients' health journey from assessment to meal planning.</p>
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

export default NutritionWorkFlow;
