let gl; //WebGL对象
let program;
let canvas; // 画布
let points = []; // 绘制点列表
let verticesColor = []; // 绘制点颜色列表
let count = 5; // 迭代次数
let delay = 100; // 默认延迟
// buffer section
let bufferID; // 存储顶点
let colorID; // 存储颜色
let aPos; // 存储attribute pos变量
let aColor; // 存储attribute color 变量
let uTheta; // 存储uniform theta变量
let uCenterX; // 存储centerX
let centerx = 0.0;
let uCenterY; // 存储centerY
let centery = 0.0;
let theta = 0; // 旋转标记
let rSpeed = 0; // 转速

// flags
let depthChange = false;
let posChange = false;
let colorChange = false;
let fluidMode = false;

// 顶点
let vertices = [
    vec2(-0.5, -0.5),
    vec2(0, 0.5),
    vec2(0.5, -0.5)
];

let COLORS = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0) // cyan
];



window.onload = function init() {
    canvas = document.getElementById("glCanvas");
    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        this.alert("not support webgl!")
    }
    console.log("Created Webgl Context");
    // 设置Webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 加载shader
    program = initShaders(gl, "vertex", "fragment");
    gl.useProgram(program);

    document.onkeydown = function (event) {
        switch (event.keyCode) {
            case 87:
                onClickButtonGroup('w');
                break;
            case 65:
                onClickButtonGroup('a');
                break;
            case 83:
                onClickButtonGroup('s');
                break;
            case 68:
                onClickButtonGroup('d');
                break;
        }
    }

    // Draw Recursive Triangle
    // drawRecursiveTriangle(gl, program, 5);
    drawRecursiveSnowFlower(gl, program, 0);


};

// function triangle(a, b, c) {
//     points.push(a, b, c)
// }
//
// function divideTriangle(a, b, c, count) {
//
//     // check for end of recursion
//
//     if (count === 0) {
//         triangle(a, b, c);
//     } else {
//
//         //bisect the sides找中点
//         let ab = mix(a, b, 0.5);
//         let ac = mix(a, c, 0.5);
//         let bc = mix(b, c, 0.5);
//
//         //--count;
//         count--;
//
//         // three new triangles，递归调用
//         divideTriangle(a, ab, ac, count);
//         divideTriangle(c, ac, bc, count);
//         divideTriangle(b, ab, bc, count);
//     }
// }

function divideLine(a, b, count) {
    if (count === 0) {
        points.push(a);
        points.push(b);

        verticesColor.push(randChoice(COLORS));
        verticesColor.push(randChoice(COLORS));
    } else {
        let p1 = mix(a, b, 1.0 / 3.0);
        let p3 = mix(a, b, 2.0 / 3.0);
        let c = Math.cos(radians(60));
        let s = Math.sin(radians(60));
        let v = subtract(p3, p1);
        v = vec2(v[0] * c - v[1] * s, v[0] * s + v[1] * c);
        let p2 = add(p1, v);
        count--;
        divideLine(a, p1, count);
        divideLine(p1, p2, count);
        divideLine(p2, p3, count);
        divideLine(p3, b, count);

    }
}

// function renderTriangle() {
//     gl.clear(gl.COLOR_BUFFER_BIT);
//     // do something
//     gl.drawArrays(gl.TRIANGLES, 0, points.length);
//     // console.log("1");
//     setTimeout(function () {
//         requestAnimFrame(renderTriangle);
//     }, delay);
// }

function renderLines() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // do something
    epoll();

    gl.drawArrays(gl.LINES, 0, points.length);
    console.log("1");
    setTimeout(function () {

        requestAnimFrame(renderLines);
    }, delay);
}

// function drawRecursiveTriangle(gl, program, numToDivide) {
//     count = numToDivide;
//     // Start to draw
//     // First, initialize the corners of our gasket with three points
//     let vertices = [
//         vec2(-1, -1),
//         vec2(0, 1),
//         vec2(1, -1)
//     ];
//
//     divideTriangle(vertices[0], vertices[1], vertices[2], count);
//
//     let bufferID = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
//     gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
//
//     let aPos = gl.getAttribLocation(program, "aPosition");
//     gl.enableVertexAttribArray(aPos);
//     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
//     render(gl.TRIANGLES);
// }

function drawRecursiveSnowFlower(gl, program, numToDivide) {
    count = numToDivide;

    divideLine(vertices[0], vertices[1], count);
    divideLine(vertices[1], vertices[2], count);
    divideLine(vertices[2], vertices[0], count);

    // Process Position
    bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    console.log(points);
    aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Process color
    colorID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColor), gl.STATIC_DRAW);
    console.log(verticesColor);

    aColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);



    uTheta = gl.getUniformLocation(program, "uTheta");
    uCenterX = gl.getUniformLocation(program, "uCenterX");
    uCenterY = gl.getUniformLocation(program, "uCenterY");



    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.LINES, 0, points.length);
    renderLines();
    // 模拟鼠标点击事件
    // let oEvent = document.createEvent("MouseEvents");
    // oEvent.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0,
    //     575, 400, false, false, false, false, 0, null);
    // canvas.dispatchEvent(oEvent);
}

function epoll() {
    // do something about translate and rotate

    theta += rSpeed;
    gl.uniform1f(uTheta, theta);

    if (depthChange) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColor), gl.STATIC_DRAW);
    }
    if (posChange) {
        console.log("Changed Center Point");
        console.log(centerx);
        console.log(centery);
        gl.uniform1f(uCenterX, centerx);
        gl.uniform1f(uCenterY, centery);
        document.getElementById("pos").innerText = `x: ${centerx.toFixed(2)}, y: ${centery.toFixed(2)}`
    }

    if (colorChange) {
        gl.bindBuffer(gl.ARRAY_BUFFER, colorID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColor), gl.STATIC_DRAW);
    }

    if (fluidMode) {
        verticesColor = [];
        for (let i = 0; i < points.length; i++) {
            verticesColor.push(randChoice(COLORS));
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, colorID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColor), gl.STATIC_DRAW);
    }

    depthChange = false;
    posChange = false;
    colorChange = false;

}

// 交互方法
function ondepthchange(event) {
    document.getElementById("depthValue").innerText = event.target.value;
    count = parseInt(event.target.value);
    points = [];
    verticesColor = [];
    divideLine(vertices[0], vertices[1], count);
    divideLine(vertices[1], vertices[2], count);
    divideLine(vertices[2], vertices[0], count);
    depthChange = true;
}

function onspinchange(event) {
    let v = Number(event.target.value);
    let element = document.getElementById("spinValue");
    if (v < 0) {
        element.innerText = "Anticlockwise rotation: " + v;
        rSpeed = -v / 500;
    } else if (v == 0) {
        element.innerText = "Still";
        rSpeed = 0;
    } else {
        element.innerText = "Clockwise rotation: " + v;
        rSpeed = -v / 500;
    }

    // do something here
    delay = 16;
    // delay -= Math.abs(v);
    // console.log("delay:", delay)
}

function oncenterchange(event) {
    let box = canvas.getBoundingClientRect();
    // 拿到canvas的宽度范围
    let xMin = box.left;
    let xMax = box.right;
    let yMin = box.top;
    let yMax = box.bottom;
    let canvasCX = (xMin + xMax) / 2;
    let canvasCY = (yMax + yMin) / 2;

    // console.log(`canvas盒子范围为 x:${xMin}-${xMax}, y: ${yMin} - ${yMax}, center: ${canvasCX}, ${canvasCY}, 点击位置为: ${event.clientX}, ${event.clientY}`);
    // console.log(2* (event.clientX - canvasCX)/canvas.width);
    centerx = 2 * (event.clientX - canvasCX) / canvas.width;
    centery = 2 * (event.clientY - canvasCY) / canvas.height;
    posChange = true;

}

function oncolorchange() {
    verticesColor = [];
    for (let i = 0; i < points.length; i++) {
        verticesColor.push(randChoice(COLORS));
    }

    colorChange = true;

}


function onClickButtonGroup(command) {
    switch (command) {
        case 'w':
            centery -= 0.1;
            break;
        case 'a':
            centerx -= 0.1;
            break;
        case 's':
            centery += 0.1;
            break;
        case 'd':
            centerx += 0.1;
            break;
    }

    posChange = true;
}

function toggleFluid() {
    fluidMode = !fluidMode;
}


// Utils
function randChoice(arrayLike) {
    let num = Math.floor(Math.random() * arrayLike.length);
    return arrayLike[num];
}