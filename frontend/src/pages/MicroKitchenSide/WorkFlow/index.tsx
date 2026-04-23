import React from "react";
import { 
  FileText, 
  Utensils, 
  ClipboardCheck, 
  Package, 
  Truck, 
  CreditCard, 
  Star,
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

const MicroKitchenWorkFlow: React.FC = () => {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 1,
      title: "Inspection Reports",
      description: "Review and manage kitchen hygiene and safety reports.",
      icon: <FileText className="w-6 h-6" />,
      path: "/microkitchen/inspection-report",
      status: "current",
    },
    {
      id: 2,
      title: "Daily Prep List",
      description: "Get daily meal requirements from assigned patients.",
      icon: <Utensils className="w-6 h-6" />,
      path: "/microkitchen/daily-prep",
      status: "pending",
    },
    {
      id: 3,
      title: "Kitchen Execution",
      description: "Manage real-time cooking and food preparation tasks.",
      icon: <ClipboardCheck className="w-6 h-6" />,
      path: "/microkitchen/kitchen-execution",
      status: "pending",
    },
    {
      id: 4,
      title: "Order Management",
      description: "Track and process orders from patients and non-patients.",
      icon: <Package className="w-6 h-6" />,
      path: "/microkitchen/orders",
      status: "pending",
    },
    {
      id: 5,
      title: "Delivery Setup",
      description: "Assign and manage global delivery logistics.",
      icon: <Truck className="w-6 h-6" />,
      path: "/microkitchen/delivery/global",
      status: "pending",
    },
    {
      id: 6,
      title: "Payment Snapshots",
      description: "Monitor and verify order payment histories.",
      icon: <CreditCard className="w-6 h-6" />,
      path: "/microkitchen/order-payments",
      status: "pending",
    },
    {
      id: 7,
      title: "Reviews & Feedback",
      description: "View patient feedback and improve service quality.",
      icon: <Star className="w-6 h-6" />,
      path: "/microkitchen/reviews",
      status: "pending",
    },
  ];

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>Micro Kitchen Workflow</h1>
        <p>Streamline your kitchen operations from prep to delivery and feedback.</p>
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

export default MicroKitchenWorkFlow;
