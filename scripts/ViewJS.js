/**
 * Базовый класс по работе с интерфейсом
 */
export class ViewJS {

    /**
     * Удаление элемента по ID
     * с удалением всех навешенных events и child
     * @param {string} elementID
     * @return {boolean}
     */
    static removeElementByID(elementID){

        let el = document.getElementById(elementID);
        if(el){
            ViewJS.clearChild(elementID);
            el.remove();
            return true;
        }

        return false;
    }

    /**
     * Удаление элемента с удалением всех навешенных events и child
     * @param {HTMLElement} object
     */
    static removeElementByObject(object){
        if(object !== null) {
            ViewJS.clearChild(object);
            object.remove();
        }
    }

    /**
     * Удаление элемента с удалением всех навешенных events и child
     * @param {HTMLElement|string} element
     * @return {boolean|void}
     */
    static removeElement(element){
        if(typeof element === "object"){
            return ViewJS.removeElementByObject(element);
        }
        else{
            return ViewJS.removeElementByID(element);
        }
    }

    /**
     * "чистка" указанного элемента от всех child
     * @param {HTMLElement|string} element
     * @return {boolean}
     */
    static clearChild(element){
        let el;
        if(typeof element === "object")
            el = element;
        else if(document.getElementById(element))
            el = document.getElementById(element);
        else
            return false;

        if(el !== null) {
            while (el.firstChild) {
                el.removeChild(el.lastChild);
            }
        }
        return true;
    }

    /**
     * диалоговое окно для принятия решения. Работает с Jquery Dialog UI
     * @param {object} settings настройки: title(string),modal(bool),resizable(bool),position,content
     * @param {Function<Promise>|null} yesClb колбек по кнопке "Да", внутрь функции передается 1 параметр - объект диалога,
     * на возврате ожидается Promise
     * @param {Function<Promise>|null} noClb колбек по кнопке "Нет", внутрь функции передается 1 параметр - объект диалога,
     * на возврате ожидается Promise
     * @param {Function|null} openClb триггер что запускается при открытии окна диалога. Внутрь функции передается 1 параметр - объект диалога
     * @param {Function<Promise>|null} closeClb Триггер, что запустится при закрытии окна диалога. внутрь функции передается 1 параметр - объект диалога,
     * на возврате ожидается Promise
     * @return {Promise<string|*>}
     */
    static confirm(settings,yesClb=null,noClb=null,openClb=null,closeClb=null){
        return new Promise((resolve,reject) => {
            if(!settings){
                console.warn('confirm->settings are empty! Aborted');
                reject(new Error('confirm->settings are empty! Aborted'));
                return;
            }

            let confirm;

            $('<div>').dialog({
                title: settings.title || 'title не указан',
                modal: settings.modal || false,
                resizable: settings.resizable || false,
                position: settings.position || {at:'center center'},
                width: '50%',
                open: function () {
                    confirm = this;

                    if(settings.content)
                        confirm.innerHTML = settings.content;

                    if(openClb)
                        openClb(confirm);
                },
                close: function () {
                    if (closeClb) {
                        closeClb(confirm)
                            .then(result=> {
                                $(confirm).dialog('destroy');
                                resolve(result);
                            });
                    }
                    else{
                        resolve('close');
                        $(confirm).dialog('destroy');
                    }
                },
                buttons: {
                    'Да': function (e) {
                        if (yesClb) {
                            e.target.disabled = true;
                            e.target.innerHTML = '<img src="/theme/imgs/gaika.GIF" style="height: 12px;" alt="load">';
                            yesClb(e.target, confirm)
                                .then(result => {
                                    resolve(result);
                                })
                                .catch(e => {
                                    if(e && e.target) {
                                        e.target.disabled = false;
                                        e.target.innerHTML = '<img src="/theme/imgs/gaika.GIF" style="height: 12px;" alt="load">';
                                    }
                                    reject(e);
                                })
                                .finally(() => $(confirm).dialog('destroy'));
                        } else
                            $(confirm).dialog('destroy');
                    },
                    'Нет': function (e) {
                        if (noClb) {
                            e.target.disabled = true;
                            e.target.innerHTML = '<img src="/theme/imgs/gaika.GIF" style="height: 12px;" alt="load">';
                            noClb(e.target, confirm)
                                .then(result => {
                                    resolve(result);
                                })
                                .catch(e => {
                                    reject(e);
                                })
                                .finally(() => $(confirm).dialog('destroy'));
                        } else
                            $(confirm).dialog('destroy');
                    }
                }
            })
        });
    }

    /**
     * Диалоговое окно сообщения на экран.
     * Работает на jquery Dialog UI
     * @param {string} msg сообщение. Может содержать Html-теги
     * @param {string} title текст заглавия
     */
    static alert(msg,title='Сообщение'){
        $('<div>').dialog({
            title:title,
            width:'50%',
            position:{at:'center center'},
            modal:true,
            open:function (){
                this.innerHTML = msg;
            },
            buttons:{
                'Ok':function (){
                    $(this).dialog('destroy');
                }
            }
        });
    }

    /**
     * обращение к элементу
     * @param {string} id
     * @return {HTMLElement|null}
     */
    static loadTpl(id){
        if(document.getElementById(id))
            return document.getElementById(id);
        console.warn(`id:"${id}" not found!`);
        return null;
    }

    /**
     * Создание элемента select
     * @param list список
     * @param selected
     * @param params
     * @return {HTMLSelectElement}
     */
    static createSelect(list=[], selected= 0, params={}){
        let object = document.createElement('select');
        for(let id in list){
            object.options[object.options.length] = new Option(list[id],id);
        }

        for (let name in params){
            if( typeof params[name] === 'object'){
                for (let childName in params[name]){
                    object[name][childName] = params[name][childName];
                }
            }
            else
                object.setAttribute(name,params[name]);
        }
        object.value = selected;

        return object;
    }

    /**
     * создание элемента input
     * @param {object} params атрибуты элемента. Вписывають в объект с такими же названиями как идолжны быть в жэлементе
     * не предусмотрено создание эммитеров: метод превратит все в текст
     * @return {HTMLInputElement}
     */
    static createInput(params){
        let object = document.createElement('input');
        for (let name in params){
            if( typeof params[name] === 'object'){
                for (let childName in params[name]){
                    object[name][childName] = params[name][childName];
                }
            }
            else
                object.setAttribute(name,params[name]);
        }

        return object;
    }
}