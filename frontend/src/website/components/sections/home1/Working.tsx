import { useEffect, useState } from "react";
import Image from "../../Image";
import { getWorkflowSteps } from "@/utils/api";

interface WorkflowStep {
    id: number;
    title: string;
    description: string;
    icon_class: string;
    image?: string;
    image_url?: string;
}

const MOCK_STEPS = [
    {
        id: 1,
        title: "Get Appointment",
        description: "On the other hand, we denounce with righteous indignation.",
        icon_class: "icon-20",
        image: "/website/assets/images/resource/working-1.jpg",
    },
    {
        id: 2,
        title: "Start Check-Up",
        description: "On the other hand, we denounce with righteous indignation.",
        icon_class: "icon-21",
        image: "/website/assets/images/resource/working-2.jpg",
    },
    {
        id: 3,
        title: "Enjoy Healthy Life",
        description: "On the other hand, we denounce with righteous indignation.",
        icon_class: "icon-22",
        image: "/website/assets/images/resource/working-3.jpg",
    },
];

export default function Working() {
    const [steps, setSteps] = useState<WorkflowStep[]>(MOCK_STEPS);

    useEffect(() => {
        const fetchSteps = async () => {
            try {
                const response = await getWorkflowSteps();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                if (data.length > 0) {
                    setSteps(data);
                }
            } catch (error) {
                console.error("Failed to fetch workflow steps:", error);
            }
        };
        fetchSteps();
    }, []);

    return (
        <section className="working-section sec-pad centred">
            <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-8.png)" }}></div>
            <div className="auto-container">
                <div className="sec-title mb_60">
                    <span className="sub-title mb_5">How It Works</span>
                    <h2>How it helps you to keep <br />healthy</h2>
                    <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                </div>
                <div className="inner-container p_relative">
                    <div className="arrow-shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-18.png)" }}></div>
                    <div className="row clearfix">
                        {steps.map((step, index) => (
                            <div key={step.id || index} className="col-lg-4 col-md-6 col-sm-12 working-block">
                                <div className="working-block-one">
                                    <div className="inner-box">
                                        <div className="image-box">
                                            <figure className="image" style={{ width: '250px', height: '250px', borderRadius: '50%', overflow: 'hidden' }}>
                                                <Image 
                                                    src={step.image_url || step.image || `/website/assets/images/resource/working-${(index % 3) + 1}.jpg`} 
                                                    alt={step.title} 
                                                    width={250} 
                                                    height={250} 
                                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                    priority 
                                                />
                                            </figure>
                                            <span className="count-text">{String(index + 1).padStart(2, '0')}</span>
                                        </div>
                                        <div className="lower-content">
                                            <h3>{step.title}</h3>
                                            <p>{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
