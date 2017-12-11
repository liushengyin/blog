import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
// import 'rxjs/Rx';
import {Observable}  from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';

@Injectable()
export class Data {

    public categoryList:any;

    public user = '';
    public companyName = '';
    // public userurl = "http://manager.liushengyin.net/api/";
    public userurl = "https://www.liushengyin.com/api/";
    // public userurl = "http://www.liushengyin.com/api/";

    public userName = '';
    public account = "";
    public role = "";
    public chainID = "";
    public local;
    public userPriv:any = {};
    public test = this;
    public providers :any;
    public defaultProvider;
    public entry:string = "";
    constructor(public http:Http) {}

    get(url) {
        if(typeof url === 'string' && url.indexOf('http') < 0){
           url = this.userurl + url;
        }
        return  this.http.get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    post(url , data){
        if(typeof url === 'string' && url.indexOf('http') < 0){
           url = this.userurl + url;
        }
        let body = this.param(data);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return  this.http.post(url, body, options)
            .map(this.extractResponse)
            .catch(this.handleError);
    }

    blobPost(url, name, value, filename='blob'){
        return new Promise(resolve=>{
            var formData = new FormData();
            formData.append(name, value, filename);
            var oReq = new XMLHttpRequest();
            oReq.open("POST", this.userurl+ url);
            oReq.onload = (oEvent) => {
                console.log(oReq);
                resolve(oReq);
            };
            oReq.send(formData);
        });

    }
    extractData(res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        try {
            res = res.json();
        } catch (e){
          if(res.hasOwnProperty('_body')){
            //处理没有权限的情况
            if(res._body.indexOf('user-deny') > -1)
            {
             throw new Error('您没有该权限！');
            }
          }
        }
        return res;
    }

    extractResponse(res){
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        try {
            res = res.json();
        } catch (e){
          if(res.hasOwnProperty('_body')){
            if(res._body.indexOf('user-deny') > -1)
            {
             throw new Error('您没有该权限！');
            }
          }
        }
        return res;
    }
    static handleErr(message){
        console.log(message);
    }
    handleError (error) {
        // In a real world app, we might send the error to remote logging infrastructure
        let errMsg = error.message || 'networkError';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
    param(obj){
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        //  console.log(query.length ? query.substr(0, query.length - 1) : query);
        return query.length ? query.substr(0, query.length - 1) : query;
    }
    //对于base64编码的URL，其length属性与图片存储大小的关系还需要研究，现在只是做一个参考

      //压缩函数
    imgToBlob(imgURI) {
        return new Promise(resolve=>{
            let img = new Image();
            img.src = imgURI;

            img.onload = ()=> {
              // let maxSize = 200 * 1024;
              let canvas = document.createElement("canvas");
              let ctx = canvas.getContext('2d');
              let tCanvas = document.createElement("canvas");
              let tctx = tCanvas.getContext("2d");

              // let initSize = img.src.length;
              let width = img.width;
              let height = img.height;
              //canvas的大小有限制,如果canvas的大小大于大概五百万像素（即宽高乘积）的时候，不仅图片画不出来，其他什么东西也都是画不出来的.所以是对图片的宽高进行适当压缩
            //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
              let ratio;
              if ((ratio = width * height / 4000000) > 1) {
                ratio = Math.sqrt(ratio);
                width /= ratio;
                width = Math.ceil(width);
                height /= ratio;
                height = Math.ceil(height);
              } else {
                ratio = 1;
              }
              canvas.width = width;
              canvas.height = height;
              //png转jpg时，需要铺白色底色
              // 铺底色
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              //canvas的瓦片，目前不了解，一般用于地图app拼画面，以后再研究
              //解决ios的限制：如果图片的大小超过两百万像素，图片也是无法绘制到canvas上的，用toDataURL获取图片数据的时候获取到的是空的图片数据
              //如果图片像素大于100万则使用瓦片绘制
              //理解瓦片绘制就是先把图片分割成块，分块绘制在canvas上，但是下面分块计算有一点不懂。（应该是按每块100万像素来分的）
              let count;
              if ((count = width * height / 1000000) > 1) {
                count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
              //计算每块瓦片的宽和高
              let nw = ~~(width / count);
              let nh = ~~(height / count);
              tCanvas.width = nw;
              tCanvas.height = nh;
              for (let i = 0; i < count; i++) {
                for (let j = 0; j < count; j++) {
                  tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                  ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                }
              }
              }else{
              ctx.drawImage(img, 0, 0, width, height);
              }
              //canvas的toDataURL是只能压缩jpg的，当用户上传的图片是png的话，就需要转成jpg，后面的数字为压缩比
              //进行最小压缩
              let ndata = canvas.toDataURL('image/jpeg', 0.4);
              resolve(this.dataURLtoBlob(ndata));
            };
        })
    }

    // dataURL转blob
    dataURLtoBlob(dataurl) {
        console.log(dataurl.length);
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    }
    //处理简单的json转array,去除空字段,将key和value同时存入数组
    toArray(obj){
        let array = [];
        for (let index in obj){
            if(obj[index]){
                let container:any = {};
                container.key = index;
                container.value = obj[index];
                array.push(container);
            }
        }
        return array;
    }

    //获取今天的日期
    getToday(){
        let date = new Date();
        let month = Number(date.getMonth()) + 1;
        let today = date.getFullYear() + '-' + this.toZero(month) + '-' + this.toZero(date.getDate());
        return today;
    }
    getTodayTime(){
        let date = new Date();
        let month = Number(date.getMonth()) + 1;
        let todayTime = date.getFullYear() + '-' + this.toZero(month) + '-' + this.toZero(date.getDate()) + " " + this.toZero(date.getHours()) + ":" + this.toZero(date.getMinutes())
            + ":" + this.toZero(date.getSeconds());
        return todayTime;
    }
    //处理日期
    toZero(num){
        if(num>9){
            return '' + num;
        }else{
            return '0' + num;
        }
    }
    //按时间进行排序
    sortByDate(date1,date2){
        date1 = date1.split(/[-\s:]/);
        date2 = date2.split(/[-\s:]/);
        return Date.UTC(date2[0],date2[1],date2[2],date2[3],date2[4],date2[5]) -
            Date.UTC(date1[0],date1[1],date1[2],date1[3],date1[4],date1[5]);
    }
    toZeroThree(num){
        if(num < 10){
            return '00' + num;
        }else{
            if(num<100){
                return '0' + num;
            }else{
                return '' + num;
            }
        }
    }
    //随机获取默认的头像
    getDefaultAvatar(){
        let avatars=['assets/img/default/default_contact1.png','assets/img/default/default_contact2.png','assets/img/default/default_contact3.png','assets/img/default/default_contact4.png','assets/img/default/default_contact5.png'];
        return avatars[Math.round(Math.random()*4)];
    }
    //联合json
    extend(des, src, override){
        if(src instanceof Array){
            for(var i = 0, len = src.length; i < len; i++)
                this.extend(des, src[i], override);
        }
        for( var index in src){
            if(override || !(index in des)){
                des[index] = src[index];
            }
        }
        return des;
    }
    //将post数据进行转换
    toJsonString(obj){
        let array = [];
        let postData:any = {};
        for (let item in obj){
            array.push({'name':item,'value':obj[item]})
        }
        postData.jsonStr = JSON.stringify(array);
        return postData;
    }
    //ping服务器
    ping(){
        // let url = "sys/misc-ping-.html";
        // setInterval(()=>{
        //     this.get(url).subscribe(
        //         data =>{},
        //         error =>{}
        //     );
        // },120000);//1000为1秒钟
    }


    toDecimal2(x) {
    // if (isNaN(parseFloat(x))) {
    //     return false;
    // }
    let f = Math.round(x*100)/100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
    }

    isEmptyObject(obj){
        for ( let name in obj ) {
        return false;
        }
        return true;
    }
    linkParams(params){
        let p = '';
        for(let index in params){
            p += "-" + params[index];
        }
        return p + '.json';
    }


    //计算指定日期与今日相差的天数，传入参数以"year-month-day"的形式
    calculateDaysToToday(dateString){
        console.log(dateString);
        let thisday = new Date();
        let year = thisday.getFullYear();//number格式
        let month = thisday.getMonth();
        let date = thisday.getDate();
        let dateArray = dateString.split('-');
        let nowTime = new Date(year,month,date);
        let startTime = new Date(parseInt(dateArray[0]),parseInt(dateArray[1])-1,parseInt(dateArray[2]));
        let dayToToday = Math.abs((Number(nowTime)-Number(startTime)) / (1000*60*60*24));
        return dayToToday;
    }
    //去除html字符
    removeCharacter(data){
        let reg = /<[^>]+>(.*?)<\/[^>]+>/g;
        return data.replace(reg,($0,$1)=>{return $1;});
    }
}
