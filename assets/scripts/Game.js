// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


cc.Class({
    extends: cc.Component,

    properties: {
        // todo 找到批量处理预置元素的方案
        fruit: {
            default: null,
            type: Array
        },
        fruitPrefab: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab2: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab3: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab4: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab5: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab6: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab7: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab8: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab9: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab10: {
            default: null,
            type: cc.Prefab
        },
        fruitPrefab11: {
            default: null,
            type: cc.Prefab
        },
        juiceSprite1_1: {
            default: null,
            type: cc.SpriteFrame,
        },
        juiceSprite1_2: {
            default: null,
            type: cc.SpriteFrame,
        },
        juiceSprite1_3: {
            default: null,
            type: cc.SpriteFrame,
        },
        boomAudio: {
            default: null,
            type: cc.AudioClip
        },
        knockAudio: {
            default: null,
            type: cc.AudioClip
        },
        waterAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 开启物理引擎
        this.initPhysics()

        // 开启碰撞检测
        this.initCollapse()

        this.isCreating = false
        // 监听点击事件 todo 是否能够注册全局事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)

        this.initFirst()
    },

    start() {
        console.log('start')
    },

    initCollapse() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true
    },
    initPhysics() {
        const instance = cc.director.getPhysicsManager()
        instance.enabled = true
        // instance.debugDrawFlags = 4

        instance.gravity = cc.v2(0, -960);
        let width = this.node.width;
        let height = this.node.height;

        let node = new cc.Node();

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        const _addBound = (node, x, y, width, height) => {
            let collider = node.addComponent(cc.PhysicsBoxCollider);
            collider.offset.x = x;
            collider.offset.y = y;
            collider.size.width = width;
            collider.size.height = height;
        }

        _addBound(node, 0, -height / 2, width, 20);
        _addBound(node, 0, height / 2, width, 20);
        _addBound(node, -width / 2, 0, 20, height);
        _addBound(node, width / 2, 0, 20, height);

        node.parent = this.node;


        // add mouse joint
        let joint = node.addComponent(cc.MouseJoint);
        joint.mouseRegion = this.node;
    },

    initFirst() {
        this.currentFruit = this.createFruit(0, 400)
    },

    onTouchStart(e) {
        if (this.isCreating) return
        this.isCreating = true

        const pos = e.getLocation()
        let {x, y} = pos
        x = x - 320
        y = y - 480
        const randomType = Math.floor(Math.random() * 5) + 1

        const fruit = this.currentFruit

        const action = cc.sequence(cc.moveBy(0.3, cc.v2(x, 0)).easing(cc.easeCubicActionIn()), cc.callFunc(() => {

            this.startFruitPhysics(fruit)
            // 重新生成一个
            this.scheduleOnce(() => {
                this.currentFruit = this.createFruit(0, 400, randomType)
                this.isCreating = false
            }, 1)
        }))

        fruit.runAction(action)
    },
    createOneFruit(num) {
        const prefabMap = {
            1: this.fruitPrefab,
            2: this.fruitPrefab2,
            3: this.fruitPrefab3,
            4: this.fruitPrefab4,
            5: this.fruitPrefab5,
            6: this.fruitPrefab6,
            7: this.fruitPrefab7,
            8: this.fruitPrefab8,
            9: this.fruitPrefab9,
            10: this.fruitPrefab10,
            11: this.fruitPrefab11,
        }

        const fruit = cc.instantiate(prefabMap[num]);
        // const sp = fruit.getComponent(cc.Sprite)
        // sp.spriteFrame = 123
        fruit.lv = num

        fruit.on('beginContact', ({self, other}) => {
            other.node.off('beginContact') // 两个node都会触发，todo 看看有没有其他方法只展示一次的

            self.node.removeFromParent(false)
            other.node.removeFromParent(false)

            const {x, y} = other.node
            const newFruit = this.createFruit(x, y, Math.min(num + 1, 11))

            this.startFruitPhysics(newFruit)
            // 展示动画
            newFruit.scale = 0
            newFruit.runAction(this.getScaleAction())

            this.createFruitJuice(cc.v2({x, y}), other.node.width)
        })

        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static
        fruit.getComponent(cc.PhysicsCircleCollider).radius = 0

        this.node.addChild(fruit);

        return fruit
    },
    startFruitPhysics(fruit) {
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic
        const physicsCircleCollider = fruit.getComponent(cc.PhysicsCircleCollider)
        physicsCircleCollider.radius = fruit.height / 2
        physicsCircleCollider.apply()

    },

    createFruit(x, y, type = 1) {
        const fruit = this.createOneFruit(type)


        fruit.setPosition(cc.v2(x, y));
        return fruit
    },

    getScaleAction(node) {
        return cc.scaleTo(0.2, 1).easing(cc.easeCubicActionIn())
    },

    // 合并时的动画效果
    createFruitJuice(pos, n) {
        // 播放合并的声音
        cc.audioEngine.play(this.boomAudio, false, 1);
        cc.audioEngine.play(this.waterAudio, false, 1);

        const RandomInteger = function (e, t) {
            return Math.floor(Math.random() * (t - e) + e)
        }

        // 果粒
        for (let i = 0; i < 10; ++i) {
            const node = new cc.Node('Sprite');
            const sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.juiceSprite1_1;
            node.parent = this.node;

            const a = 359 * Math.random(),
                i = 30 * Math.random() + n / 2,
                l = cc.v2(Math.sin(a * Math.PI / 180) * i, Math.cos(a * Math.PI / 180) * i);
            node.scale = .5 * Math.random() + n / 100;
            const p = .5 * Math.random();

            node.position = pos;
            node.runAction(
                cc.sequence(cc.spawn(cc.moveBy(p, l),
                    cc.scaleTo(p + .5, .3),
                    cc.rotateBy(p + .5, RandomInteger(-360, 360))),
                    cc.fadeOut(.1),
                    cc.callFunc(function () {
                        node.active = false
                    }, this))
            )
        }

        // 水珠
        for (let f = 0; f < 20; f++) {
            const node = new cc.Node('Sprite');
            const sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.juiceSprite1_2;
            node.parent = this.node;

            let a = 359 * Math.random(), i = 30 * Math.random() + n / 2,
                l = cc.v2(Math.sin(a * Math.PI / 180) * i, Math.cos(a * Math.PI / 180) * i);
            node.scale = .5 * Math.random() + n / 100;
            let p = .5 * Math.random();
            node.position = pos
            node.runAction(cc.sequence(cc.spawn(cc.moveBy(p, l), cc.scaleTo(p + .5, .3)), cc.fadeOut(.1), cc.callFunc(function () {
                node.active = false
            }, this)))
        }

        // 果汁
        const node = new cc.Node('Sprite');
        const sp = node.addComponent(cc.Sprite);

        sp.spriteFrame = this.juiceSprite1_3;
        node.parent = this.node;

        node.position = pos
        node.scale = 0
        node.angle = RandomInteger(0, 360)
        node.runAction(cc.sequence(cc.spawn(cc.scaleTo(.2, n / 150), cc.fadeOut(1)), cc.callFunc(function () {
            node.active = false
        })))
    }


    // update (dt) {},
});