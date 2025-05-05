import React, { useContext } from 'react';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';


interface RoleGuardProps {
  requiredRole: string;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {

  const { roles, auth } = useContext(FirebaseAuthContext);

  if (!roles?.includes(requiredRole)) {
    return <div className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div className="alert alert-danger" role="alert">
        <div>
          You do not have the required permissions to view this content.
        </div>
        {auth && <button className="btn btn-primary mt-3" onClick={() => auth.signOut()}>Log Out</button>}
      </div>

    </div>;
  }

  return <>{children}</>;
};

export default RoleGuard;