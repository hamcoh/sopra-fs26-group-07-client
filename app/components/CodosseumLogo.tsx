import Image from "next/image";

interface CodosseumLogoProps {
  size?: number;
}

const CodosseumLogo: React.FC<CodosseumLogoProps> = ({ size = 60 }) => (
  <Image
    src="/codosseum_icon.svg"
    alt="Codosseum Logo"
    width={size}
    height={size}
  />
);

export default CodosseumLogo;
