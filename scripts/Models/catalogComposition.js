import {ModelJS} from "../ModelJS.js";
import {SubCategoryComposition} from "./SubCategoryComposition.js";

/*
* Модель каталога (категория-подкатегория-товар)
* */
export class CatalogComposition extends ModelJS {
    static _structure = {
        categoryID: this.INT,
        categoryName: this.STRING,
        isDel: this.INT,
        subCategories: this.UNCHECKED,
    };

    constructor(object) {
        super();
        this.subCategories = [];
        CatalogComposition._fillObject(this, object);
        this.edited = 0;
    }

    /**
     * Обновление полей в указанном плане
     * @param {ProductionPlansComposition} target в каком плане обновлять
     * @param {object} data данные для актуализации. Структура подобная _structure данного класса
     * @private
     */
    static _fillObject(target,data){
        for (let i in data){
            if(CatalogComposition._structure[i] !== undefined)
            {
                if (i == "subCategories"){
                    for (let d in data['subCategories']) {
                        target.pushSubCategories(new SubCategoryComposition(data['subCategories'][d]));
                    }
                }
                else{
                    target[i] = target._validate(data[i], CatalogComposition._structure[i]);
                }
            }
        }
    }

    /**
     * Добавляет еще одну подкатегорию к списку
     * @param {SubCategoryComposition} subCat
     */
    pushSubCategories(subCat) {
        this.subCategories.push(subCat);
    }

    /**
     * Возвращает массив данных по каталогу
     * @param params - набор фильтров (заготовка под фильтры)
     * statusID {int}статус плана (1- в работе, 2- завершённый)
     * categoryID {int} ID категории
     * categoryName {string} наименование категории
     * @return {Promise<[catalogComposition]>}
     */
    static getModels(params) {
        return new Promise((resolve, reject) => {
//заготовка под использование фильтров
/*
            let form = null;
            if (JSON.stringify(params) !== "{}"){
                form = new FormData();
                if(params.statusID)
                    form.append('statusID', params.statusID);
                if(params.categoryID)
                    form.append('categoryID', params.categoryID);
                if(params.categoryName)
                    form.append('categoryName', params.categoryName);
            }
*/
           CatalogComposition.fetch('/scripts/Models/composer.json', {
                //body: form,
                method: 'GET'
            })
                .then(res => res.json())
                .then(res => {
                    let result = [];
                    if (res.categories !== undefined && res.categories.length > 0) {
                        for (let ii in res.categories) {
                            result.push(new CatalogComposition(res.categories[ii]));
                        }
                        
                        resolve(result);
                    }
                    else if (res.categories !== undefined && res.categories.length == 0) {
                        resolve(result);
                    } else if (res.state === 2) {
                        reject(new Error(res.error));
                    } else {
                        reject(new Error('Неверный ответ от сервера'));
                    }
                })
                .catch(e => {
                    reject(e);
                });

//заготовка под получение данных с сервера
/*
            catalogComposition.fetch('/GetCatalogList', {
                body: form,
                method: 'POST'
            })
                .then(res => res.json())
                .then(res => {
                    let result = [];
                    if (res.categories !== undefined && res.categories.length > 0) {
                        for (let ii in res.categories) {
                            result.push(new CatalogComposition(res.categories[ii]));
                        }
                        
                        resolve(result);
                    }
                    else if (res.categories !== undefined && res.categories.length == 0) {
                        resolve(result);
                    } else if (res.state === 2) {
                        reject(new Error(res.error));
                    } else {
                        reject(new Error('Неверный ответ от сервера'));
                    }
                })
                .catch(e => {
                    reject(e);
                });
*/
        });
    }

    /**
     * Получить список подкатегорий по текущей категории
     * @return {Promise<Array<SubCategoryComposition>>}
     */
    getSubCategories() {
        if (this.subCategories.length > 0)
            return Promise.resolve(this.subCategories);
    }
    
    //region getters

    /**
     * categoryID текущей категории
     * @return {number}
     * @constructor
     */
    get ID(){
        return this.categoryID;
    }

    /**
     * categoryName текущей категории
     * @return {string}
     * @constructor
     */
    get Name(){
        return this.categoryName;
    }

  
     /**
     * subCategoriesList - список подкатегорий
     * @return {array}
     * @constructor
     */
    get subCategoriesList(){
        return this.subCategories;
    }


    /**
     * isDel - статус текущей категории удалённый/неудалённый (1/0)
     * @return {int}
     * @constructor
     */
    get deleted(){
        return this.isDel;
    }

    //endregions

    //region setters

    /**
     * categoryID текущей категории
     * @param {catalogComposition.ID} value
     * @constructor
     */
    set ID(value){
        this.categoryID = value;
    }

    /**
     * categoryName текущей категории
     * @param {catalogComposition.Name} value
     * @constructor
     */
    set Name(value){
        this.categoryName = value;
        this._edited = 1;
    }

    /**
     * isDel - статус текущей категории удалённый/неудалённый (1/0)
     * @param {catalogComposition.isDel} value
     */
    set deleted(value){
        this.isDel = value;
        this._edited = 1;
    }

    /**
     * Флаг сигнализирующий о факте редактирования объекта
     * @param {this._edited} value
     */
    set edited(value){
        this._edited = value;
    }

    //endregion
}