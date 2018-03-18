// Converts from degrees to radians.
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};


export function clampAngle(angle) {   //funckja zwracajaca podany kat w przedziałe 0-2PI
    if (angle > 2 * Math.PI)
        return angle - Math.PI * 2;
    if (angle < -Math.PI * 2)
        return angle + Math.PI * 4;
    if (angle < 0)
        return angle + Math.PI * 2;

    return angle
}


export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image)
        })
        image.src = url;
    })
}

export function loadJSON(url) {
    return fetch(url).then(resolve => resolve.json())

}

export function RectCirCollision(RectX, RectY, CircleX, CircleY, CircleRadius, RectWidth = 1, RectHeight = 1) {
    let DeltaX = CircleX - Math.max(RectX, Math.min(CircleX, RectX + RectWidth));
    let DeltaY = CircleY - Math.max(RectY, Math.min(CircleY, RectY + RectHeight));
    return (Math.pow(DeltaX, 2) + Math.pow(DeltaY, 2)) < (Math.pow(CircleRadius, 2));
}


