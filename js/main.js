let eventBus = new Vue()

Vue.component('note', {
    props: {
        types: ''
    },
    data() {
        return {
            notes: [],
            comment: '',
        }
    },
    template: `
        <div>
            <div class="m-3" v-for="note in notes" v-show="note.type == types ">
                <div class="p-3 border" :class="{ 'border-success': note.compliteInTime, 'border-danger': !note.compliteInTime && note.type == 'col-4', 'border-primary': !note.compliteInTime}">
                    <h5>{{note.title}} ({{note.noteId}}) - <span style="color: red;" @click="deleteNote(note.noteId)">X</span></h5>
                    <p>{{ note.description }}</p>
                    <p><hr>
                    Дата создания: {{ note.dateCreate }}<br>
                    Дэдлайн: {{ note.dateDeadline }} - {{ note.compliteInTime }}<br>
                    <span v-if="note.dateUpdate.length != 0">Дата изменения: {{ note.dateUpdate }}</span>
                    <hr>
                    </p>
                    <p v-if="note.comment.length > 0">Комментарий:<br>{{ note.comment }}</p>
                    <div v-if="note.type != 'col-4'">
                        <span class="btn btn-warning" @click="noteUpdate(note)">Редактировать...</span>
                        <div class="mt-2">
                            <span class="btn btn-success" @click="changeType(note)">Перенести</span>
                            <span v-if="note.type == 'col-3'" class="btn btn-danger" @click="comeBack(note)">Вернуть</span>
                            <div class="mt-3" v-if="note.type == 'col-3'">
                                <form>
                                    <div class="form-floating mb-3">
                                        <textarea class="form-control comeback" id="textarea" style="height: 200px; resize: none;" v-model="comment"></textarea>
                                        <label for="textarea">Введите причину возврата:</label>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        eventBus.$on('note-created', note => {
            this.notes.push(note)
        })
        eventBus.$on('note-updated', note => {
            for (el in this.notes) {
                if (this.notes[el].noteId == note.noteId) {
                    console.log(this.notes[el])
                    this.notes[el].title = note.title
                    this.notes[el].description = note.description
                    this.notes[el].dateDeadline = note.dateDeadline
                    this.notes[el].dateUpdate = note.dateUpdate
                }
            }
        })
    },
    methods: {
        deleteNote(id) {
            for (note in this.notes) {
                if (this.notes[note].noteId == id) {
                    this.notes.splice(note, 1)
                }
            }
        },
        noteUpdate(note) {
            eventBus.$emit('update-note', note)
        },
        changeType(note) {
            if (note.type == 'col-1') {
                note.type = 'col-2'
            } else {
                if (note.type == 'col-2') {
                    note.type = 'col-3'
                } else {
                    if (note.type == 'col-3') {
                        note.type = 'col-4'
                        let dateComplite = new Date().toLocaleDateString().split('.')
                        let dateDeadline = note.dateDeadline.split('.')
                        note.dateComplite = dateComplite
                        if ( Number(dateComplite[2]) >= Number(dateDeadline[2]) ) {
                            if ( Number(dateComplite[1]) >= Number(dateDeadline[1]) ) {
                                if ( Number(dateComplite[0]) >= Number(dateDeadline[0]) ) {
                                    note.compliteInTime = false
                                } else { note.compliteInTime = true }
                            } else { note.compliteInTime = true }
                        } else { note.compliteInTime = true }
                    }
                }
            }
        },
        comeBack(note) {
            if (this.comment ) {
                note.comment = this.comment
                note.type = 'col-1'
                this.comment = ''
            }
        }
    }
})

Vue.component('create-note', {
    data() {
        return {
            noteId: 0,
            title: '',
            description: '',
            dateDeadline: '',
            note: '',
            update: false,
            errors: []
        }
    },
    template: `
        <div>
            <ul>
                <li v-for="error in errors">{{error}}</li>
            </ul>
            <form class="d-flex flex-column mt-4 " @submit.prevent="createNote">
                <fieldset>
                    <input class="form-control mb-3" type="text" placeholder="Заголовок" v-model="title">
                    <div class="form-floating mb-3">
                        <textarea class="form-control" id="textarea" style="height: 200px; resize: none;" v-model="description"></textarea>
                        <label for="textarea">Введите описание задачи здесь:</label>
                    </div>
                    <div class="mb-4">
                        <label class="color-white" for="deadline">Дэдлайн</label>
                        <input class="mt-3" name="deadline" type="date" min="2023-01-01" v-model="dateDeadline">
                    </div>
                    <input v-if="!update" class="btn btn-primary" type="submit" value="Создать">
                    <input v-if="update" class="btn btn-primary" @click="updateNote" @click="modal" value="Изменить">
                    <div v-if="!update" class="btn btn-danger ms-4" @click="modal">Закрыть форму</div>
                </fieldset>
            </form>
        </div>
    `,
    methods: {
        createNote() {
            if (this.title && this.description && this.dateDeadline) {
                let inputDate = this.dateDeadline.split('-')
                let note = {
                    noteId: this.noteId += 1,
                    title: this.title,
                    description: this.description,
                    type: 'col-1',
                    dateCreate: new Date().toLocaleDateString(),
                    dateDeadline: inputDate[2] + '.' + inputDate[1] + '.' + inputDate[0],
                    dateUpdate: '',
                    dateComplite: '',
                    comment: '',
                    compliteInTime: ''
                }
                eventBus.$emit('note-created', note)
                this.title = null
                this.description = null
                this.dateDeadline = null
                this.errors = []
            } else {
                this.errors = []
                if (!this.title) this.errors.push("Введите заголовок!")
                if (!this.description) this.errors.push("Введите описание задачи!")
                if (!this.dateDeadline) this.errors.push("Введите дату дэдлайна!")
            }
        },
        updateNote() {
            if (this.title && this.description && this.dateDeadline) {
                let inputDate = this.dateDeadline.split('-')
                let updatedNote = {
                    noteId: this.noteId,
                    title: this.title,
                    description: this.description,
                    type: this.note.type,
                    dateCreate: this.note.dateCreate,
                    dateDeadline: inputDate[2] + '.' + inputDate[1] + '.' + inputDate[0],
                    dateUpdate: new Date().toLocaleDateString(),
                    dateComplite: '',
                    comment: this.note.comment,
                    compliteInTime: ''
                }
                eventBus.$emit('note-updated', updatedNote)
                this.title = null
                this.description = null
                this.dateDeadline = null
                this.errors = []
                this.update = false
            } else {
                this.errors = []
                if (!this.title) this.errors.push("Введите заголовок!")
                if (!this.description) this.errors.push("Введите описание задачи!")
                if (!this.dateDeadline) this.errors.push("Введите дату дэдлайна!")
            }
        },
        openUpdateNote() {
            let display = true
            eventBus.$emit('update-display', display)
            let deadline = this.note.dateDeadline.split('.')
            this.noteId = this.note.noteId
            this.title = this.note.title
            this.description = this.note.description
            this.dateDeadline = deadline[2] + '-' + deadline[1] + '-' + deadline[0]
        },
        modal() {
            let displayModal = false
            eventBus.$emit('getModal', displayModal)
        }
    },
    mounted() {
        eventBus.$on('update-note', note => {
            this.note = note
            this.update = true
            this.openUpdateNote()
        })
    }
})

let app = new Vue({
    el: '#app',
    data: {
        types: ['col-1', 'col-2', 'col-3', 'col-4'],
        displayModal: false
    },
    mounted() {
        eventBus.$on('getModal', displayModal => {
            this.displayModal = displayModal
        })
        eventBus.$on('update-display', display => {
            this.displayModal = display
        })
    },
    methods: {
        modal() {
            if (this.displayModal == false) {
                this.displayModal = true
            } else {
                this.displayModal = false
            }
        }
    }
})