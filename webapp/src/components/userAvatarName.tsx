type Props = {
    displayName?: string | null;
    photoURL?: string | null;
}

const UserAvatarName = (user: Props) => {
    const { displayName, photoURL } = user;

    return (
        <div className="d-flex align-items-center">
            { photoURL && <img
                src={photoURL}
                alt={displayName ?? "Unknown User Avatar"}
                className="rounded-circle"
                style={{ width: '40px', height: '40px' }}
            />
            }
            {
                displayName &&  <span className="ps-2">{displayName}</span>
            }
        </div>
    );
}

export default UserAvatarName;