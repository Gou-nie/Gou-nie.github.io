<template>
    <div class="hugPare">
        <div class="param-div">
            <span class="span">你的名字:</span>
            <input class="input" v-model="role1Name" />
            <span class="span">对方的名字:</span>
            <input class="input" v-model="role2Name" />
        </div>
        <divider></divider>
        <font color=#ccbbaa>*请手动输入你们的经纬度:3* </font>

        <div class="param-div">
            <span class="span">{{ role1Name }}的经度</span>
            <input type="number" class="input" v-model="longitudeInD" />°
            <input type="number" class="input" v-model="longitudeInF" />′
            <input type="number" class="input" v-model="longitudeInM" />″
        </div>
        <div class="param-div">
            <span class="span">{{ role1Name }}的纬度</span>
            <input type="number" class="input" v-model="latitudeInD" />°
            <input type="number" class="input" v-model="latitudeInF" />′
            <input type="number" class="input" v-model="latitudeInM" />″
        </div>
        <div class="param-div">
            <span class="span">{{ role2Name }}的经度</span>
            <input type="number" class="input" v-model="longitude2InD" />°
            <input type="number" class="input" v-model="longitude2InF" />′
            <input type="number" class="input" v-model="longitude2InM" />″
        </div>
        <div class="param-div">
            <span class="span">{{ role2Name }}的纬度</span>
            <input type="number" class="input" v-model="latitude2InD" />°
            <input type="number" class="input" v-model="latitude2InF" />′
            <input type="number" class="input" v-model="latitude2InM" />″
        </div>
        <button
            :disabled="latitudeInD == 0 && longitudeInD == 0 && latitudeInF == 0 && longitudeInF == 0 && latitudeInM == 0 && longitudeInM == 0"
            class="calcultation" @click="handleCalculate">抱抱他</button>
        <div>
            <span v-if="direction != ''">现在{{ role2Name + '大概在' + role1Name + direction + '距离' + distance + '公里的地方'
                }}</span>

        </div>
        <div>
            <span v-if="direction != ''">{{ '请' + role1Name + '将指南针指向' + directionDes + '°' }}</span>
        </div>
        <font v-if="direction != ''" color=#aabbcc>面朝这个方向张开双手 「オラに元気を分けてくれ！」 或者抱一下🤗</font>
        <font v-if="direction != ''" color=#aabbbb>:∂ 感谢你们的元气 </font>
    </div>
</template>


<script>
export default {
    data() {
        return {
            icon: 'iconfont icon-hug',
            role1Name: '你',
            role2Name: 'gn',
            latitudeIn: 0,
            longitudeIn: 0,
            latitudeInD: 0,
            longitudeInD: 0,
            latitudeInF: 0,
            longitudeInF: 0,
            latitudeInM: 0,
            longitudeInM: 0,

            latitude2In: 0,
            longitude2In: 0,
            latitude2InD: 31,
            longitude2InD: 121,
            latitude2InF: 13,
            longitude2InF: 28,
            latitude2InM: 50,
            longitude2InM: 25,

            latitudeHome: 31.2304,
            longitudeHome: 121.4737,
            latitudeCompany: 31.1711,
            longitudeCompany: 121.3864,
            directionDes: 0,
            direction: '',
            distance: 0
        }
    },
    mounted() {
        this.getQAddress()
    },
    methods: {
        getQAddress() {
            fetch(import.meta.env.VITE_API_URL+'/read_file/address.txt')
                .then(response => response.json())
                .then(data => {
                    this.getInfoByStr(data.content);
                })
                .catch(error => {
                    console.error('Error:', error)
                    this.getInfoByStr(null)
                });
        },
        getInfoByStr(content) {
            let str;
            if (content == null) {
                str = "latitude=31°7'47N\nlongitude=121°22'1E"
            } else {
                str = content;
            }

            // 匹配纬度和经度
            let regex = /latitude=(\d+)°(\d+)'(\d+)([NS])\nlongitude=(\d+)°(\d+)'(\d+)([EW])/;
            let match = str.match(regex);

            if (match) {
                this.latitude2InD = parseInt(match[1], 10);
                this.latitude2InF = parseInt(match[2], 10);
                this.latitude2InM = parseInt(match[3], 10);
                let latDir = match[4];

                this.longitude2InD = parseInt(match[5], 10);
                this.longitude2InF = parseInt(match[6], 10);
                this.longitude2InM = parseInt(match[7], 10);
                let lonDir = match[8];

                console.log("纬度:", latDegree, latMinute, latSecond, latDir);
                console.log("经度:", lonDegree, lonMinute, lonSecond, lonDir);
            } else {
                console.log("无法匹配经纬度");
            }
        },
        handleCalculate() {
            // console.log('lat:', parseInt(this.latitudeInD), this.latitudeInF, this.latitudeInM);
            // console.log('lon:', parseInt(this.longitudeInD), parseInt(this.longitudeInF), parseInt(this.longitudeInM));
            this.latitudeIn = (parseInt(this.latitudeInD) + parseInt(this.latitudeInF) / 60 + parseInt(this.latitudeInM) / 3600);
            this.longitudeIn = (parseInt(this.longitudeInD) + parseInt(this.longitudeInF) / 60 + parseInt(this.longitudeInM) / 3600);
            this.latitude2In = (parseInt(this.latitude2InD) + parseInt(this.latitude2InF) / 60 + parseInt(this.latitude2InM) / 3600);
            this.longitude2In = (parseInt(this.longitude2InD) + parseInt(this.longitude2InF) / 60 + parseInt(this.longitude2InM) / 3600);

            // console.log('lat Company:', this.latitude2In );
            // console.log('lon Company:', this.longitude2In );

            const bearing = this.calculateBearing(this.latitudeIn, this.longitudeIn, this.latitude2In, this.longitude2In);
            // console.log('bearing:', bearing);//116.8
            this.directionDes = bearing.toFixed(2);
            // console.log('directionDes:', this.directionDes);
            this.direction = this.bearingToDirection(bearing);
            // console.log('direction:', this.direction);
            this.distance = this.getDistanceFromLatLonInKm(this.latitudeIn, this.longitudeIn, this.latitude2In, this.longitude2In);
        },
        calculateBearing(lat1, lon1, lat2, lon2) {
            // 转为弧度
            const toRadians = deg => deg * Math.PI / 180;
            const toDegrees = rad => rad * 180 / Math.PI;

            lat1 = toRadians(lat1);
            lon1 = toRadians(lon1);
            lat2 = toRadians(lat2);
            lon2 = toRadians(lon2);

            const dLon = lon2 - lon1;

            const x = Math.sin(dLon) * Math.cos(lat2);
            const y = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

            let initialBearing = Math.atan2(x, y);
            initialBearing = toDegrees(initialBearing);
            const compassBearing = (initialBearing + 360) % 360;

            return compassBearing;
        },
        bearingToDirection(bearing) {
            const directions = [
                "北偏东", "东偏北",
                "东偏南", "南偏东",
                "南偏西", "西偏南",
                "西偏北", "北偏西"
            ];
            const index = Math.floor((bearing % 360) / 45);
            // console.log('bearing%360:', (bearing % 360));
            // console.log('bearing%360%45:', (bearing % 360)%45);
            let a = ((bearing % 360) % 45).toFixed(2);
            if (index % 2 != 0) {
                a = (45 - a).toFixed(2);
            }

            return directions[index] + '方向偏' + a + `°`;

        },
        getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = this.deg2rad(lat2 - lat1);
            const dLon = this.deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // 距离，单位为公里
            return distance.toFixed(2);
        },

        deg2rad(deg) {
            return deg * (Math.PI / 180);
        }
    }
}
</script>

<style>
hub {
    display: flex;
    flex-wrap: wrap;
}

hugPare {
    display: grid;
}

.param-div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-family: sans-serif;
    padding: 10px;
}

input {
    width: 60px;
    padding: 4px;
    text-align: center;
}

span {
    font-weight: bold;
    margin-right: 4px;
}

calcultation {
    padding: 6px 12px;
    margin-left: 10px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
}

/* 正常状态的悬停效果 */
calcultation:not(:disabled):hover {
    background-color: #0069d9;
}

/* 禁用状态样式 */
calcultation:disabled {
    cursor: not-allowed;
    background-color: #cccccc;
    color: #666666;
    /* 如果需要还可以添加透明度 */
    /* opacity: 0.65; */
}
</style>