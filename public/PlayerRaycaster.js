import {clampAngle} from "./Utilities.js";
import Raycaster from './Raycaster.js'

export default class PlayerRaycaster extends Raycaster {
    constructor(fov, stripWidth, canvasWidth, canvasHeight, renderEngine) {
        super(fov, (canvasWidth / 2) / Math.tan(Math.radians(fov / 2)), Math.ceil(canvasWidth / stripWidth));
        this.mapWidth = 0;
        this.mapHeight = 0;

        this.renderEngine = renderEngine;

        this.screenWidth = canvasWidth;
        this.screenHeight = canvasHeight;

        this.stripWidth = stripWidth;

    }


    setMapSize(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
    }


    performRayCast(player, map, objects) {


        let that = this;

        //CHECK OBJECTS TO DRAW
        for (let i = 0; i < objects.length; i++) {

            let distX = objects[i].position.x - player.x + .5;
            let distY = objects[i].position.y - player.y + .5;
            let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
            let angle = Math.atan2(distY, distX) - player.rot
            let area = that.viewDist / (Math.cos(angle) * dist)

            if (clampAngle(angle) <= that.fov || clampAngle(angle) + that.fov >= Math.PI * 2) {
                let drawY = (that.screenHeight - area) / 2;
                let drawX = that.viewDist * Math.tan(angle) + that.screenWidth / 2 - area / 2;

                that.renderEngine.addObjectToDraw({
                    id: objects[i].id,
                    drawX: drawX,
                    drawY: drawY,
                    size: area,
                    dist: dist,
                })
            }
        }

        for (let i = 0; i < this.numRays; i++) {
            // pozycja stripa na ekranie
            let rayScreenPos = (-this.numRays / 2 + i) * this.stripWidth;

            // dystans od gracza do środka ekranu
            let rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + this.viewDist * this.viewDist);

            // kąt promienia relatywny do pozycji gracza
            let rayAngle = Math.asin(rayScreenPos / rayViewDist); //asin to taki sinus w druga strone z liczby tworzy kont

            castSingleRay(player.rot + rayAngle, i);
        }


        function castSingleRay(rayAngle, stripIdx) {


            rayAngle = clampAngle(rayAngle)

            // Sprawdzanie w ktorą stronę porusza się promień za pomocą ćwiartek układu współrzędnych
            let right = (rayAngle > Math.PI * 2 * 0.75 || rayAngle < Math.PI * 2 * 0.25);
            let up = (rayAngle < 0 || rayAngle > Math.PI);

            //ID uderzonej ściany
            let textureID = 0;


            let dist = 0;	// dystans do ściany
            let textureX;	// część tekstury która będzie renderowana


            let isDark = false;

            // Sprawdzanie pionowych zderzeń (vertical)

            let angleTan = Math.tan(rayAngle);
            let dXVer = right ? 1 : -1; 	// przesówa się o blok w lewo/prawp
            let dYVer = dXVer * angleTan; 	// odległość poruszania się w górę i dół

            let x = right ? Math.ceil(player.x) : Math.floor(player.x);	//startowa pozycja x
            let y = player.y + (x - player.x) * angleTan;			// startowa pozycja y, poprawiona o przesunięcie z linijki wyżej

            while (x >= 1 && x < that.mapWidth && y >= 0 && y < that.mapHeight) {  //dopoki x i y mieszczą sie w granicach mapy
                let wallX = Math.floor(x + (right ? 0 : -1)); //-1 bo zebiramy hit z prawej strony a jak tego nie ma
                let wallY = Math.floor(y);


                if (map[wallY][wallX] > 0) { //sprawdzanie czy punkt jest ścianą
                    let distX = x - player.x;
                    let distY = y - player.y;
                    dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));	// dystans do ściany do kwadratu (Pitagoras)

                    textureID = map[wallY][wallX]; // przypisanie ID trafionej ściany
                    textureX = y % 1;	//miejsce trafionego punktu w przedziale od (0-1)
                    if (!right) textureX = 1 - textureX; // jeżeli patrzymy w lewo tekstura musi byc odwrócona


                    break; //znalazł ściane wiec dalej nie musi szulać
                }
                x += dXVer;
                y += dYVer;
            }


            //Sprawdzanie poziomych zderzeń i sprawdzanie ktore jest bliżej

            let angleCtg = 1 / angleTan;
            let dYHor = up ? -1 : 1;
            let dXHor = dYHor * angleCtg;
            y = up ? Math.floor(player.y) : Math.ceil(player.y);
            x = player.x + (y - player.y) * angleCtg;

            while (x >= 0 && x < that.mapWidth && y >= 1 && y < that.mapHeight) {
                let wallY = Math.floor(y + (up ? -1 : 0));
                let wallX = Math.floor(x);

                if (map[wallY][wallX] > 0) {
                    let distX = x - player.x;
                    let distY = y - player.y;
                    let blockDist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

                    //sprawdzanie ktory dystans jest krótszy

                    if (!dist || blockDist < dist) {
                        dist = blockDist;
                        isDark = true;
                        textureID = map[wallY][wallX];
                        textureX = x % 1;
                        if (up) textureX = 1 - textureX;
                    }
                    break;
                }
                x += dXHor;
                y += dYHor;
            }

            if (dist) {

                let oldDist = dist;
                //pozbycie sie efektu rybiego oka
                dist = dist * Math.cos(player.rot - rayAngle);

                let height = that.viewDist / dist;

                let y = (that.screenHeight - height) / 2;
                let x = stripIdx * that.stripWidth

                textureX *= 63;// tekstruy maja po 64 pikesele


                that.renderEngine.addStripToRender({
                    textureID: textureID,
                    textureX: textureX,
                    x: x,
                    y: y,
                    stripWidth: that.stripWidth,
                    height: height,
                    isDark: isDark,
                    dist: oldDist,
                })

            }

        }


    }
}