import React from 'react';

export const SignupForm: React.FC = () => {
    return (
        <form className="mt-4">
            <div className="mb-3">
                <label htmlFor="djName" className="form-label">DJ Name</label>
                <input type="text" className="form-control" id="djName" placeholder="Enter your DJ name" />
            </div>
            <div className="mb-3">
                <label htmlFor="timeAvailability" className="form-label">Time Availability (Include Timezones)</label>
                <textarea className="form-control" id="timeAvailability" rows={3} placeholder="Enter your availability"></textarea>
            </div>
            <div className="mb-3">
                <label htmlFor="liveOrPrerecord" className="form-label">Live or Prerecord</label>
                <select className="form-select" id="liveOrPrerecord">
                    <option value="Live">Live</option>
                    <option value="New Prerecord">New Prerecord</option>
                    <option value="Existing Prerecord">Existing Prerecord</option>
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="streamLink" className="form-label">Stream Link</label>
                <input type="url" className="form-control" id="streamLink" placeholder="Enter your stream link" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
};