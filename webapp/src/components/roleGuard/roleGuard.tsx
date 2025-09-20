import React, { useContext } from 'react';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';
import Spinner from '../spinner/Spinner';
import { Alert } from 'react-bootstrap';

type RoleGuardProps = {
  requireAnyRole?: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requireAnyRole, children }) => {

  const { roles, auth, isSimulatingRoles, actualRoles, clearRoleSimulation } = useContext(FirebaseAuthContext);

  if(!auth || !roles) {
    return <Spinner type="logo" />;
  }

  if (requireAnyRole && requireAnyRole.length > 0) {
    if (!roles?.some((role: string) => requireAnyRole.includes(role))) {
      return <div className="d-flex justify-content-center align-items-center vh-100 text-center">
        <div className="alert alert-danger" role="alert">
          <div>
            You do not have the required permissions to view this content.
          </div>
          <div className="mt-2">
            <small className="text-muted">
              Required: {requireAnyRole.join(' or ')} | 
              Your roles: {roles.join(', ') || 'none'}
            </small>
          </div>
          {isSimulatingRoles && (
            <Alert variant="warning" className="mt-3">
              <small>
                <strong>Role Simulation Active:</strong> You're simulating roles [{roles.join(', ')}]. 
                Your actual roles are [{actualRoles?.join(', ')}].
                Use the Role Simulation button in the navbar to change or clear simulation.
              </small>
            </Alert>
          )}
          <div className="d-flex gap-2 justify-content-center mt-3">
            {isSimulatingRoles && clearRoleSimulation && (
              <button className="btn btn-warning" onClick={() => clearRoleSimulation()}>
                Cancel Role Simulation
              </button>
            )}
            {auth && <button className="btn btn-primary" onClick={() => auth.signOut()}>Log Out</button>}
          </div>
        </div>
      </div>;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;