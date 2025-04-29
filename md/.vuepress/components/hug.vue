<template>
    <div class="div">
        <font color=#ccbbaa>*不获取权限，手动输入您的经纬度:3* </font>
        <div class="param-div">
            <span class="span">经度</span>
            <input type="number" class="input" v-model="longitudeInD" />°
            <input type="number" class="input" v-model="longitudeInF" />′
            <input type="number" class="input" v-model="longitudeInM" />″
        </div>
        <div class="param-div">
            <span class="span">纬度</span>
            <input type="number" class="input" v-model="latitudeInD" />°
            <input type="number" class="input" v-model="latitudeInF" />′
            <input type="number" class="input" v-model="latitudeInM" />″
        </div>
        <button :disabled="latitudeInD == 0 && longitudeInD == 0 && latitudeInF == 0 && longitudeInF == 0 && latitudeInM == 0 && longitudeInM == 0 " class="calcultation" @click="handleCalculate">计算</button>
        <span v-if="direction != ''">现在我在你{{ direction +'距离'+ distance+'公里的地方' }}</span>
        <span>将指南针指向{{ directionDes + '°' }}</span>
        <font v-if="direction != ''" color=#aabbcc>面朝这个方向张开双手 「オラに元気を分けてくれ！」 或者抱一下🤗</font>
        <font v-if="direction != ''" color=#aabbbb>:∂ 感谢你的元气 </font>
    </div>
</template>


<script>
export default {
    data() {
        return {
            icon: 'iconfont icon-hug',
            latitudeIn: 0,
            longitudeIn: 0,
            latitudeInD: 0,
            longitudeInD: 0,
            latitudeInF: 0,
            longitudeInF: 0,
            latitudeInM: 0,
            longitudeInM: 0,

            latitudeHome: 31.2304,
            longitudeHome: 121.4737,
            latitudeCompany: 31.1711,
            longitudeCompany: 121.3864,
            directionDes: 0,
            direction: '',
            distance:0
        }
    },
    mounted() {
    },
    methods: {
        handleCalculate() {
            console.log('lat:', parseInt(this.latitudeInD), this.latitudeInF, this.latitudeInM);
            console.log('lon:', parseInt(this.longitudeInD), parseInt(this.longitudeInF), parseInt(this.longitudeInM));
            this.latitudeIn = (parseInt(this.latitudeInD )+ parseInt(this.latitudeInF )/ 60 + parseInt(this.latitudeInM )/ 3600);
            this.longitudeIn = (parseInt(this.longitudeInD) + parseInt(this.longitudeInF) / 60 + parseInt(this.longitudeInM) / 3600);
            
            console.log('lat Company:', this.latitudeIn );
            console.log('lon Company:', this.longitudeIn );

            const bearing = this.calculateBearing(this.latitudeIn, this.longitudeIn, this.latitudeCompany, this.longitudeCompany);
            this.directionDes = bearing.toFixed(2);
            this.direction = this.bearingToDirection(bearing);
            console.log('lat:', this.latitudeIn);
            console.log('lon:', this.longitudeIn);
            this.distance = this.getDistanceFromLatLonInKm(this.latitudeIn, this.longitudeIn, this.latitudeCompany, this.longitudeCompany);
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
            let a = (45 - (bearing % 360) % 45).toFixed(2);
            const index = Math.floor(((bearing + 22.5) % 360) / 45);
            return directions[index] + '方向偏' + a + `°`;

            // const directions = [
            //     "正北", "北偏东", "东北", "东偏北",
            //     "正东", "东偏南", "东南", "南偏东",
            //     "正南", "南偏西", "西南", "西偏南",
            //     "正西", "西偏北", "西北", "北偏西"
            // ];
            // const index = Math.floor(((bearing + 11.25) % 360) / 22.5);
            // return directions[index] + '方向';
        },
        getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            const R = 6371; // 地球半径，单位为公里
            const dLat = this.deg2rad(lat2 - lat1); // 纬度差值
            const dLon = this.deg2rad(lon2 - lon1); // 经度差值
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

div {
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