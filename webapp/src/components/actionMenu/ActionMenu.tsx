import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";

export type ActionMenuOption = {
  label: string,
  icon?: IconProp
  onClick: () => void,
} | "divider";

type Props = {
  className?: string,
  options: ActionMenuOption[]
}

const ActionMenu = ({ options, className }: Props) => {
  return <div className={className}>
    <Dropdown>
      <Dropdown.Toggle variant="outline-secondary">
        <FontAwesomeIcon icon={faEllipsis} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map((option, index) => {
          if (option === "divider") {
            return <Dropdown.Divider key={index} />
          }
          return <Dropdown.Item onClick={option.onClick} key={index}>
            {option.icon && <FontAwesomeIcon icon={option.icon} />} {option.label}
          </Dropdown.Item>
        })}
      </Dropdown.Menu>
    </Dropdown>
  </div>
}

export { ActionMenu }
