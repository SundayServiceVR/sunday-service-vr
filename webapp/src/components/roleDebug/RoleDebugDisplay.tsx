import { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';

export const RoleDebugDisplay = () => {
  const { roles, actualRoles, isSimulatingRoles } = useContext(FirebaseAuthContext);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  if (!actualRoles?.includes('developer')) {
    return null; // Only show for developers
  }

  return (
    <Alert variant={isSimulatingRoles ? 'warning' : 'info'} className="mb-2">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>🔧 Developer Debug:</strong>
          {isSimulatingRoles ? (
            <>
              <span className="text-warning"> Simulating roles: [{roles?.join(', ')}]</span>
              <span className="text-muted"> | Actual: [{actualRoles?.join(', ')}]</span>
            </>
          ) : (
            <span> Current roles: [{roles?.join(', ')}]</span>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default RoleDebugDisplay;