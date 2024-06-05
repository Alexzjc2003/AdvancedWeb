## 环境搭建

### 安装angular

- angular由node.js安装，首先现在命令行检查node是否已存在：`node --version`
- 如果存在，运行`npm install -g @angular/cli` 安装angular
  - 如果超时，可以使用国内镜像，先`npm cache clean --force`清除缓存，再`npm config set registry https://registry.npmmirror.com`设置镜像即可

### 创建项目

`cd code`

`ng new subjectThree --style=css`

### 运行项目

`cd subjectThree`

`ng serve`

` http://localhost:4200/`

### 其他

**安装组件库**


**创建组件**

`ng generate component HousingLocation --skip-tests`

**创建接口**

`ng generate interface housinglocation`

**创建服务**

`ng generate service housing --skip-tests`

**JSON服务器**

`npm install -g json-server`

启动`json-server --watch db.json`