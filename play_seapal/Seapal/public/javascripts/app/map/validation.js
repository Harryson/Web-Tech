function formatCoordinate(val, type) {

    var value = val.toString();

    if (/e.*/.test(value)) {
        value = "0";
    }

    value = value.replace(/\./, '\u00B0');

    value = value.replace(/[\u00B0].*/, function (s) {
        s = s.replace(/[\u00B0]/, '0.');
        s = parseFloat(s) * 60;
        s = s.toString();
        if (s.indexOf('.') == -1)
            s += ".";
        while (s.length < 5)
            s += "0";
        for (var j = s.indexOf('.') ; j < 2; j++)
            s = '0' + s;
        return '\u00B0' + s.substr(0, 5);
    });

    if (!/[\u00B0]/.test(value)) {
        value = value + "\u00B000.00";
    }

    value = value.replace(/.*[\u00B0]/, function (s) {
        var negative = false;
        if (s.substr(0, 1) == '-') {
            s = s.substring(1);
            negative = true;
        }
        var j = 3;
        if (type == "long")
            j++;

        for (var i = 0; s.length < j; i++)
            s = "0" + s;
        if (negative)
            s = "-" + s;

        return s;
    });


    if (type == "lat") {
        if (value.substr(0, 1) == "-") {
            value = value.substr(1);
            value = value + "\u2032S";
        } else {
            value = value + "\u2032N";
        }
        value = "Lat " + value;
    } else { // type == "long"
        if (value.substr(0, 1) == "-") {
            value = value.substr(1);
            value = value + "\u2032W";
        } else {
            value = value + "\u2032E";
        }
        value = "Long " + value;
    }

    return value;
}