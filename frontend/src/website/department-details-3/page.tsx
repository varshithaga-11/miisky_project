import Layout from "../components/layout/Layout";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";
export default function Departments_Details_Three() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Gastroenterology">
                <section className="service-details pt_120 pb_110">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="service-sidebar">
                                    <div className="sidebar-widget category-widget mb_40">
                                        <div className="shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-41.png)" }}></div>
                                        <div className="widget-title">
                                            <h2>Departments</h2>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="category-list clearfix">
                                                <li><Link to="/website/department-details">Cardiology</Link></li>
                                                <li><Link to="/website/department-details-2">Dental</Link></li>
                                                <li><Link to="/website/department-details-3" className="current">Gastroenterology</Link></li>
                                                <li><Link to="/website/department-details-4">Neurology</Link></li>
                                                <li><Link to="/website/department-details-5">Orthopaedics</Link></li>
                                                <li><Link to="/website/department-details-6">Dental Caring</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget appointment-widget mb_40">
                                        <div className="widget-title">
                                            <h2>Appointment</h2>
                                        </div>
                                        <div className="form-inner">
                                            <form method="post" action="/website" className="default-form">
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-45"></i></div>
                                                    <input type="text" name="name" placeholder="Name" required/>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-46"></i></div>
                                                    <input type="email" name="email" placeholder="Email" required/>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><Image src="/website/assets/images/icons/icon-15.svg" alt="Image" width={15} height={15} priority /></div>
                                                    <div className="select-box">
                                                        <select className="selectmenu">
                                                            <option>I&apos;m interested in *</option>
                                                            <option>Heart Health</option>
                                                            <option>Cardiology</option>
                                                            <option>Dental</option>
                                                            <option>Gastroenterology</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-48"></i></div>
                                                    <textarea name="message" placeholder="Message"></textarea>
                                                </div>
                                                <div className="form-group message-btn">
                                                    <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget schedule-widget">
                                        <div className="widget-title">
                                            <h2>Working Hours</h2>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="schedule-list clearfix">
                                                <li>Sunday<span>02 pm to 06 pm</span></li>
                                                <li>Monday<span>03 pm to 07 pm</span></li>
                                                <li>Tuesday<span>02 pm to 06 pm</span></li>
                                                <li>Wednesday<span>02 pm to 06 pm</span></li>
                                                <li>Thursday<span>04 pm to 06 pm</span></li>
                                                <li>Friday<span>03 pm to 08 pm</span></li>
                                                <li>Saturday<span>Closed</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="service-details-content">
                                    <div className="content-one mb_40">
                                        <figure className="image-box mb_60"><Image src="/website/assets/images/service/service-7.jpg" alt="Image" width={856} height={525} priority /></figure>
                                        <div className="text-box">
                                            <h2>Gastroenterology</h2>
                                            <p>Cardiology is the study of the heart and its functions, as well as the diagnosis and treatment of heart diseases and conditions. It encompasses a wide range of disciplines, including cardiovascular physiology, electrophysiology, and interventional Gastroenterology.<br />Cardiologists are medical professionals who specialize in the diagnosis and treatment of heart-related conditions. They may use a variety of tests and procedures to evaluate the heart&apos;s function, including electrocardiograms ECGs, echocardiograms, stress tests, and cardiac catheterization.<br />Common heart conditions treated by cardiologists include coronary artery disease, heart failure, arrhythmias, and congenital heart defects. Treatment options may include medication, lifestyle changes, surgery, or other procedures such as angioplasty or cardiac ablation.</p>
                                            <p>Preventative Gastroenterology is an important aspect of the field, as it focuses on reducing the risk of heart disease through lifestyle changes such as exercise, healthy diet, and smoking cessation.</p>
                                            <p>In summary, cardiology is a branch of medicine focused on the heart and its function, and includes the diagnosis and treatment of a variety of heart-related conditions. Cardiologists may use a variety of tests and procedures to evaluate the heart, and treatment options may include medication, lifestyle changes, surgery, or other procedures. Preventative cardiology is also an important aspect of the field, aimed at reducing the risk of heart disease.</p>
                                            <h3>Quis autem vel eum iure reprehenderit qui in voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur</h3>
                                        </div>
                                    </div>
                                    <div className="content-two">
                                        <figure className="image-box mb_30"><Image src="/website/assets/images/service/service-5.jpg" alt="Image" width={856} height={525} priority /></figure>
                                        <p>Cardiologists are medical professionals who specialize in the diagnosis and treatment of heart-related conditions. They may use a variety of tests and procedures to evaluate the heart&apos;s function, including electrocardiograms ECGs, echocardiograms, stress tests, and cardiac catheterization. Common heart conditions treated by cardiologists include coronary artery disease, heart failure, arrhythmias, and congenital heart defects. Treatment options may include medication, lifestyle changes, surgery, or other procedures such as angioplasty or cardiac ablation.</p>
                                        <ul className="list-style-one clearfix">
                                            <li>25-30% estimated savings in implementation when using Mobile Health Clinics</li>
                                            <li>Activate Mobile Health Clinics in just weeks</li>
                                            <li>Flexible, on-demand access to care services</li>
                                            <li>Supports referrals to provider networks and care management programs</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Cta/>
            </Layout>
        </div>
    )
}
