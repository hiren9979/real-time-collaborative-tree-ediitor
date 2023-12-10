import { Button } from "@mui/material";

const CustomMenu = ({ nodeDatum, handleClick }) => {
  return (
    <div>
      <Button
        id={`demo-positioned-button-${nodeDatum.node_id}`}
        aria-controls={Window.open ? `demo-positioned-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={Window.open ? "true" : undefined}
        onClick={handleClick}
      >
        Dashboard
      </Button>
    </div>
  );
};

const renderCustomNode =
  (handleClick) =>
  ({ nodeDatum }) => {
    return (
      <g>
        <foreignObject>
          <CustomMenu
            nodeDatum={nodeDatum}
            handleClick={(event) => handleClick(event, nodeDatum)}
          />
        </foreignObject>
        <circle
          onClick={() => {
            document
              .getElementById(`demo-positioned-button-${nodeDatum.node_id}`)
              .click();
          }}
          r="20"
          fill="blue"
          stroke="#F0CE01"
          strokeWidth="4"
        />
        <text fill="black" strokeWidth="1" x="20">
          {nodeDatum.name}
        </text>
      </g>
    );
  };

export default renderCustomNode;
