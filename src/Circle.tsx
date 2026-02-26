interface CircleProps {
  cx: string;
  cy: string;
  radius: string;
  color: string;
}

const Circle = (props: CircleProps) => {
  const { cx, cy, radius, color } = props;
  return <circle cx={cx} cy={cy} r={radius} fill={color} />;
};

export default Circle;
