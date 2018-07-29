Vue.config.devtools = true;

Vue.component('page', {
    template: `
    <transition name="fade">
        <div v-show="is_active">
            <slot></slot>
        </div>
    </transition>
    `,
    props: {
        name: {
            require: true
        },
        selected: {
            default: false
        },
        test_stop: {
            type: Boolean
        }
    },
    data() {
        return {
            is_active: true,
        }
    },
    mounted() {
        this.is_active = this.selected
    },
})


new Vue({
    el: "#app",
    data: {
        speaker: {
            english: {
                male: "UK English Male",
                female: "UK English Female"
            },
            chinese: {
                female: "Chinese Female"
            }
        },
        pages: [],
        vocabularies: [],
        test_seconds: 10,
        test_start: false,
        test_word: '',
        test_languages: ['中文', '英文', '中英文'],
        test_language: ''
    },
    mounted() {
        this.pages = this.$children
    },
    methods: {
        select_page(selected_page) {
            this.pages.forEach((page) => {
                page.is_active = (page.name == selected_page.name)
            })
        },
        open_file(event) {
            var self = this
            var input = event.target;

            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                vocabularies = text.split('\n')
                vocabularies.forEach((w) => {
                    en_w = w.split(',')[0].trim()
                    ch_w = w.split(',')[1].trim()
                    self.vocabularies.push([en_w, ch_w])
                })
            };
            reader.readAsText(input.files[0], 'big5');
            console.log(input.files[0])
            document.getElementById('txt').href = this.make_text_file(self.vocabularies.join('\r\n'))
            document.getElementById('txt').download = 'vocabularies.txt';
        },
        start_test() {
            this.test_start = true

            var c = this.test_seconds * this.vocabularies.length
            var t
            t = setInterval(() => {
                c = c - 1
                if (c == -1) {
                    clearInterval(t)
                    this.test_start = false
                }
            }, 1000)

            let test_vocabularies = this.shuffle(this.vocabularies)
            test_vocabularies.map((v, i) => {
                setTimeout(() => {
                    if (this.test_language == '中文') {
                        responsiveVoice.speak(v[0])
                        this.test_word = v[0]
                    } else if (this.test_language == '英文') {
                        responsiveVoice.speak(v[1], this.speaker.chinese.female)
                        this.test_word = v[1]
                    } else {
                        random = Math.floor(Math.random() * 100 % 2)
                        console.log(random)
                        this.test_word = v[random]
                        if (random == 0) {
                            responsiveVoice.speak(v[random])
                        } else {
                            responsiveVoice.speak(v[random], this.speaker.chinese.female)
                        }
                    }
                }, 1000 * this.test_seconds * i)
            })
        },
        shuffle(arr) {
            let random_index, temp
            for (let i = 0; i < arr.length; i++) {
                random_index = Math.floor(Math.random() * (i + 1))
                temp = arr[i]
                arr[i] = arr[random_index]
                arr[random_index] = temp
            }
            return arr
        },
        make_text_file(text) {
            var textFile = null
            var data = new Blob([text], {
                type: 'text/plain'
            });

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            return textFile;
        }
    },
    computed: {
        now_test() {
            return this.vocabularies.findIndex((vc, index) => {
                return vc.indexOf(this.test_word) != -1
            })
        },
        total_test() {
            return this.vocabularies.length
        }
    }
})