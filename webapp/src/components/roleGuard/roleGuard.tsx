import React, { useContext } from 'react';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';
import Spinner from '../spinner';

type RoleGuardProps = {
  requireAnyRole?: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requireAnyRole, children }) => {

  const { roles, auth } = useContext(FirebaseAuthContext);

  if(!auth) {
    return <Spinner type="logo" />;
  }

  if (requireAnyRole && requireAnyRole.length > 0) {
    if (!roles?.some((role: string) => requireAnyRole.includes(role))) {
      return <div className="d-flex justify-content-center align-items-center vh-100 text-center">
        <div className="alert alert-danger" role="alert">
          <div>
            You do not have the required permissions to view this content.
          </div>
          {auth && <button className="btn btn-primary mt-3" onClick={() => auth.signOut()}>Log Out</button>}
        </div>
      </div>;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;