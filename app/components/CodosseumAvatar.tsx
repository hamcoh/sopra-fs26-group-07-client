import { Avatar } from 'antd';


interface CodosseumAvatarProps {
    id?: number;
    size?: number;
    backgroundColor?: string;
    variant?: "default" | "room" | "avatarSelection";
}


const CodosseumAvatar = ({
                             id,
                             size = 50,
                             backgroundColor = "#3b82f6",
                             variant = "default",
                         }: CodosseumAvatarProps) => {

    const iconLinks: { [key: number]: string } = {
        1: "/avatar1.png",
        2: "/avatar2.png",
        3: "/avatar10.png",
        4: "/avatar4.png",
        5: "/avatar5.png",
        6: "/avatar6.png",
        7: "/avatar7.png",
        8: "/avatar8.png",
        9: "/avatar9.png",
        10: "/avatar3.png",
    };

    const selectedIcon = iconLinks[id ?? 1] || iconLinks[1];

    return (
        <Avatar
            src={selectedIcon}
            size={size}
            style={{
                backgroundColor: 'transparent',
                padding: variant === "room"
                    ? 0
                    : variant === "avatarSelection"
                        ? "0px"
                        : "2px",
                borderRadius: '50%',

                boxShadow: variant === "room"
                    ? "none"
                    : variant === "avatarSelection"
                        ? `0 0 0 2px ${backgroundColor}`
                        : `inset 0 0 0 3px ${backgroundColor}`,

            }}

        />
    );
};

export default CodosseumAvatar;