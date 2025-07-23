// src/components/ui/avatar.jsx
function Avatar({ src, alt = "Avatar", size = 40 }) {
return (
<div
className="rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
style={{ width: size, height: size }}
>
{src ? (
<img src={src} alt={alt} className="object-cover w-full h-full" />
) : (
<AvatarFallback alt={alt} size={size} />
)}
</div>
);
}

function AvatarFallback({ alt = "Avatar", size = 40 }) {
const getInitial = () => (alt ? alt[0].toUpperCase() : "👤");
return (
<span
className="text-gray-500 text-sm"
style={{ fontSize: size / 2 }}
>
{getInitial()}
</span>
);
}

export { Avatar, AvatarFallback };