import React from 'react';
import { Link } from "react-router-dom";

type SearchPopupProps = {
  isPopup: boolean;
  handlePopup: () => void;
};

const SearchPopup: React.FC<SearchPopupProps> = ({ isPopup, handlePopup }) => {
  return (
    <div id="search-popup" className={`search-popup ${isPopup ? "popup-visible" : ""}`}>
      <div className="popup-inner">
        <div className="upper-box clearfix">
          <figure className="logo-box pull-left">
            <Link to="/website">
              <img src="/website/assets/images/logo-miisky.png" alt="Logo" />
            </Link>
          </figure>
          <div className="close-search pull-right" onClick={handlePopup}>
            <span className="far fa-times"></span>
          </div>
        </div>
        <div className="overlay-layer"></div>
        <div className="auto-container">
          <div className="search-form">
            <form method="post" action="/website">
              <div className="form-group">
                <fieldset>
                  <input
                    type="search"
                    className="form-control"
                    name="search-input"
                    placeholder="Type your keyword and hit"
                    required
                  />
                  <button type="submit">
                    <i className="far fa-search"></i>
                  </button>
                </fieldset>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
