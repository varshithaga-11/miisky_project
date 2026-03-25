import { useState } from "react";
export default function About() {
    const [date, setDate] = useState("");
  return (
        <section className="about-section alternat-2 p_relative">
            <div className="auto-container">
                <div className="appointment-box">
                    <h4>Book an Appointment</h4>
                    <div className="form-inner">
                        <form method="post" action="/website" className="clearfix">
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-15"></i></div>
                                <span>Chose services</span>
                                <div className="select-box">
                                    <select className="selectmenu">
                                        <option>Heart Health</option>
                                        <option>Cardiology</option>
                                        <option>Dental</option>
                                        <option>Gastroenterology</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-16"></i></div>
                                <span>Date</span>
                                <input
                                type="date"
                                id="date"
                                placeholder="MM / DD / YYYY"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}/>
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-17"></i></div>
                                <span>Phone</span>
                                <input type="text" name="phone" placeholder="+ 1 (XXX) XXX XXX"/>
                            </div>
                            <div className="message-btn">
                                <button type="submit" className="theme-btn btn-one"><span>Book Now</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
  );
}
