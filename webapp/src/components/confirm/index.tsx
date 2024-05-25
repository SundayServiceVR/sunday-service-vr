import { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM, { Root } from "react-dom/client";

import { Button } from "react-bootstrap";

import "./confirm.css";

export type ConfirmProps = {
  title: string|ReactNode,
  message?: string|ReactNode,
  confirmButton: {
    text: string|ReactNode,
    action: () => void
  },
  cancelButton: {
    text: string|ReactNode,
    action?: () => void
  },
  onShow?: () => void
};
function Confirm({ title, message, confirmButton, cancelButton, onShow }: ConfirmProps) {
  const [visible, setVisible] = useState(false);
  
  const overlay = useRef<HTMLDivElement|null>(null);
  
  const close = () => {
    setVisible(false);
    setTimeout(removeConfirmElement, 250);
  }
  
  useEffect(() => {
    setVisible(true);
    if(onShow) onShow();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="confirm"
      ref={overlay}
      onClick={(event) => {
        if (event.target === overlay.current) {
          close();
        }
      }}
    >
      <div
        className="confirmCard"
        style={visible ? {opacity: 1} : {opacity: 0}}
      >
        <div className="confirmCardContent">
          {title ? <h1 className="confirmCardTitle">{title}</h1> : null}
          {message ? <div className="confirmCardBody">{message}</div> : null}
          <div className="confirmCardButtons">
            <Button
              variant="success"
              size="lg"
              onClick={() => {
                if (confirmButton.action) {
                  setTimeout(confirmButton.action, 150);
                }
                close();
              }}
            >
              {confirmButton.text}
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                if (cancelButton?.action) {
                  setTimeout(cancelButton.action, 150);
                }
                close();
              }}
            >
              {cancelButton.text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirm;

let root: Root | null = null;

function removeConfirmElement() {
  const target = document.getElementById('confirm-alert');
  if (target) {
    if (root) root.unmount();
    if (target.parentNode) target.parentNode.removeChild(target);
    root = null;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function confirm(properties: ConfirmProps) {
  let divTarget = document.getElementById('confirm-alert');

  if (divTarget) {
    // Rerender - the mounted ReactConfirmAlert
    if (root === null) root = ReactDOM.createRoot(divTarget);
    root.render(<Confirm {...properties} />);
  } else {
    // Mount the ReactConfirmAlert component
    divTarget = document.createElement('div');
    divTarget.id = 'confirm-alert';
    document.body.appendChild(divTarget);

    root = ReactDOM.createRoot(divTarget);
    root.render(<Confirm {...properties} />);
  }
}