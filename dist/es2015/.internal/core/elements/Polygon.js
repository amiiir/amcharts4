/**
 * Polygon module.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { Sprite } from "../Sprite";
import { Morpher } from "../utils/Morpher";
import { registry } from "../Registry";
import * as $path from "../rendering/Path";
import * as $type from "../utils/Type";
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Draws a polygon.
 *
 * @see {@link IPolygonEvents} for a list of available events
 * @see {@link IPolygonAdapters} for a list of available Adapters
 */
var Polygon = /** @class */ (function (_super) {
    tslib_1.__extends(Polygon, _super);
    /**
     * Constructor
     */
    function Polygon() {
        var _this = _super.call(this) || this;
        _this.className = "Polygon";
        _this.element = _this.paper.add("path");
        _this.shapeRendering = "auto";
        _this._currentPoints = [];
        _this.applyTheme();
        return _this;
    }
    Object.defineProperty(Polygon.prototype, "points", {
        /**
         * @return Polygon points
         */
        get: function () {
            return this.getPropertyValue("points");
        },
        /**
         * An array of X/Y coordinates for each elbow of the polygon.
         *
         * @todo Example
         * @param points  Polygon points
         */
        set: function (points) {
            this.setPropertyValue("points", points, true);
            this._currentPoints = this.points;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Polygon.prototype, "currentPoints", {
        /**
         * @return Polygon points
         */
        get: function () {
            return this._currentPoints;
        },
        /**
         * Current points. Used when morphing the element, so that original `points`
         * are not overwritten.
         *
         * @param points  Polygon points
         */
        set: function (points) {
            if (this._currentPoints != points) {
                this._currentPoints = points;
                this.draw();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Draws the element.
     *
     * @ignore Exclude from docs
     */
    Polygon.prototype.draw = function () {
        var path = "";
        var points = this._currentPoints;
        var left;
        var right;
        var top;
        var bottom;
        if (points.length > 0) {
            // separate areas
            for (var i = 0, len = points.length; i < len; i++) {
                // surface
                var surface = points[i][0];
                var hole = points[i][1];
                if (surface && surface.length > 0) {
                    var point = surface[0];
                    path += $path.moveTo(point);
                    for (var s = 0; s < surface.length; s++) {
                        point = surface[s];
                        path += $path.lineTo(point);
                        if (!$type.isNumber(right) || (right < point.x)) {
                            right = point.x;
                        }
                        if (!$type.isNumber(left) || (left > point.x)) {
                            left = point.x;
                        }
                        if (!$type.isNumber(top) || (top > point.y)) {
                            top = point.y;
                        }
                        if (!$type.isNumber(bottom) || (bottom < point.y)) {
                            bottom = point.y;
                        }
                    }
                }
                // hole
                if (hole && hole.length > 0) {
                    var point = hole[0];
                    path += $path.moveTo(point);
                    for (var h = 0, hlen = hole.length; h < hlen; h++) {
                        point = hole[h];
                        path += $path.lineTo(point);
                    }
                }
            }
            if (path) {
                path += $path.closePath();
            }
            this.bbox.x = left;
            this.bbox.y = top;
            this.bbox.width = right - left;
            this.bbox.height = bottom - top;
        }
        if (this.setPropertyValue("path", path)) {
            if (!this.element) {
                this.element = this.paper.add("path");
            }
            this.element.attr({ "d": path });
            this.invalidatePosition();
            // otherwise is 0x0
            if (!this.inited) {
                this.events.once("inited", this.validatePosition, this, false);
            }
        }
    };
    Object.defineProperty(Polygon.prototype, "path", {
        set: function (value) {
            if (this.setPropertyValue("path", value)) {
                if (value) {
                    var valueStr = value.slice(1, value.length - 1);
                    var segments = valueStr.split("ZM");
                    var points = [];
                    for (var s = 0; s < segments.length; s++) {
                        var segment = segments[s];
                        if (segment.length > 0) {
                            var areaHole = segment.split("M");
                            var areaArr = areaHole[0];
                            var holeArr = areaHole[1];
                            if (areaArr && areaArr.length > 0) {
                                var pointsArr = areaArr.split("L");
                                if (pointsArr.length > 0) {
                                    var area = [];
                                    var areaAndHole = [area];
                                    points.push(areaAndHole);
                                    for (var p = 0; p < pointsArr.length; p++) {
                                        var coords = pointsArr[p].split(",");
                                        area.push({ x: Number(coords[0]), y: Number(coords[1]) });
                                    }
                                    if (holeArr && holeArr.length > 0) {
                                        var pointsArr_1 = holeArr.split("L");
                                        if (pointsArr_1.length > 0) {
                                            var hole = [];
                                            areaAndHole.push(hole);
                                            for (var p = pointsArr_1.length - 1; p >= 0; p--) {
                                                var coords = pointsArr_1[p].split(",");
                                                hole.push({ x: Number(coords[0]), y: Number(coords[1]) });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    this.setPropertyValue("points", points);
                    this._currentPoints = points;
                }
                if (!this.element) {
                    this.element = this.paper.add("path");
                }
                this.element.attr({ "d": value });
                this.invalidatePosition();
                // otherwise is 0x0
                if (!this.inited) {
                    this.events.once("inited", this.validatePosition, this, false);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Measures element
     */
    Polygon.prototype.measureElement = function () {
        // Overriding to avoid extra measurement.
    };
    Object.defineProperty(Polygon.prototype, "centerPoint", {
        /**
         * A calculated center point for the shape.
         *
         * @readonly
         * @return Center
         */
        get: function () {
            return { x: this.bbox.x + this.bbox.width / 2, y: this.bbox.y + this.bbox.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Polygon.prototype, "morpher", {
        /**
         * A [[Morpher]] instance that is used to morph polygon into some other
         * shape.
         *
         * @readonly
         * @return Morpher instance
         */
        get: function () {
            if (!this._morpher) {
                this._morpher = new Morpher(this);
                this._disposers.push(this._morpher);
            }
            return this._morpher;
        },
        enumerable: true,
        configurable: true
    });
    return Polygon;
}(Sprite));
export { Polygon };
/**
 * Register class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
registry.registeredClasses["Polygon"] = Polygon;
//# sourceMappingURL=Polygon.js.map