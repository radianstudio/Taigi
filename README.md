# Taigi

[http://localhost:8080/](http://localhost:8080/)


## 有幾點事情注意
* 目前有兩個聲音引擎，如果第一個聲音引擎沒過，會跑到第二個，第二個若再沒有，捨棄此題目。
* 如果有氣球上面沒有字，代表該字元為罕見字無法辨識，而這類字元，前端目前無法辨別和預防。


## Compile

`grunt`
會去 compile `sass/*.sass` 和 `coffee/*.coffee`

`grunt production`
會去 compile `sass/*.sass` 和 `coffee/*.coffee`，並且在 compile 完成後，去執行 uglify js 以及 cssmin.

`grunt listen`
會去監聽 `sass/*.sass` 和 `coffee/*.coffee` 檔案，一旦發生變更就立刻 compile.
