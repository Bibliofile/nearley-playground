import ReactDOM from 'react-dom'
import React, {Component} from 'react'
import Header from './header'
import Editor from './editor'
import Tester from './tester'
import compile from './high_level_compile'
import arithmetic from './arithmetic.ne'
import sentence from './sentence.ne'
import 'lodash'

import "./main.css"

console.log(compile(sentence))


let default_playground_state = localStorage.raw_grammar

? {
    active: 0,
    compiled_grammar: localStorage.raw_grammar,
    tabs: [
        {
            name: 'Imported from Previous Version',
            editor_value: compile(localStorage.raw_grammar).output,
            errors: compile(localStorage.raw_grammar),
            tests: JSON.parse(localStorage.tests)
        },
        {
            name: 'Fancier Example',
            editor_value: arithmetic,
            errors: '',
            tests: ['1 + 1', 'ln(5 + sin(3 + 4*e))']
        }
    ]
} : {
    active: 0,
    compiled_grammar: compile(sentence).output,
    tabs: [
        {
            name: 'Basic Example',
            editor_value: sentence,
            errors: '',
            tests: [
                'Charles sleeps while thinking about snakes.',
                'A typical Reddit user sleeps with a hammer.',
                'This test doesn\'t match :('
            ]
        },
        {
            name: 'Fancier Example',
            editor_value: arithmetic,
            errors: '',
            tests: ['1 + 1', 'ln(5 + sin(3 + 4*e))']
        }
    ]
}

if(localStorage.raw_grammar) {
    localStorage._backup_grammar = localStorage.raw_grammar
    delete localStorage.raw_grammar
}

class Playground extends Component {
    state = default_playground_state;
    componentWillMount(){
        if (localStorage.playgroundState){
            this.state = JSON.parse(localStorage.playgroundState)
        }
        // console.log('initial', this.state)
    }
    setTabSizes(){
        this.state.tabs.forEach((t, i) => {
            let ref = this.refs['tab-title-'+i]
            ref.style.width = 0
            ref.style.width = ref.scrollWidth + 2
        })        
    }
    componentDidMount(){
        this.setTabSizes()
    }
    componentWillUpdate(nextProps, nextState){
        localStorage.playgroundState = JSON.stringify(nextState)
    }
    compiled_state(v, i=this.state.active){
        let state = _.cloneDeep(this.state)
    
        let {output, errors} = compile(v)

        state.tabs[i].editor_value = v
        state.tabs[i].errors = errors || []
        state.compiled_grammar = output

        return state
    }
    setActive(i){

        let state = this.compiled_state(this.state.tabs[i].editor_value, i)
        state.active = i

        this.setState(state)
        // this.compile(this.state.tabs[i].editor_value)
    }
    setTests(tests){
        let state = _.cloneDeep(this.state)
    
        state.tabs[state.active].tests = tests
        this.setState(state)
    }
    setTabName(i, name){
        let state = _.cloneDeep(this.state)
        state.tabs[i].name = name
        this.setState(state)
    }
    deleteTab(e, i){
        e.stopPropagation()


        let state = _.cloneDeep(this.state)
        if(state.tabs.length < 2){
            this.setState({tabs: [{
                name: "Tab 1",
                editor_value: '',
                errors: '',
                tests: []                
            }]})
        } else {
            state.tabs.splice(i, 1)
            state.active = state.active <= i
                ? Math.min(state.active, state.tabs.length - 1)
                : state.active - 1

            this.setState(state)            
        }

        setImmediate(e => this.setTabSizes())
     
    }
    addTab() {
        let state = _.cloneDeep(this.state)
        state.tabs.push({
            name: 'Tab '+(state.tabs.length+1),
            editor_value: '',
            errors: '',
            tests: []
        })
        state.active = state.tabs.length - 1
        this.setState(state)

        setImmediate(e => this.setTabSizes())
    }
    render(){
        let {name, editor_value, errors, tests} = this.state.tabs[this.state.active]

        return <div className='playground'>
            <Header />
            <div className='tabs'>
                {this.state.tabs.map( 
                    ({name}, i) => <div 
                        key={i}
                        className={'tab' + (this.state.active === i ? " active" : "")}
                        onClick={e => this.setActive(i)}>
                        <input 
                            ref={'tab-title-'+i} 
                            value={name} 
                            spellCheck="false"
                            onChange={e => {
                            this.setTabName(i, e.target.value)
                            e.target.style.width = 0
                            e.target.style.width = e.target.scrollWidth + 2
                        }}/>
                        <div className='x' onClick={e => this.deleteTab(e, i)}>
                            <div>{'\u00d7'}</div>
                        </div>
                    </div>
                )}
                <div className='add' onClick={this.addTab.bind(this)}>+ Add Tab</div>
                {this.state.tabs.length == 1 && this.state.tabs[0].editor_value === ''
                    ? <div className='add grey' onClick={e=> {
                        this.setState(default_playground_state)
                        setImmediate(e => this.setTabSizes())
                    }}>Reset Examples?</div>
                    : null }
            </div>
            <div className='titles'>
                <div className='grammar-title'>
                    <div className='lp'>Grammar <span className='grey'>(autosaved to localStorage)</span></div>
                </div>
                <div className='examples-title'>
                    <div className='subtitle'>Tests <span className='grey'>(autosaved to localStorage)</span></div>
                </div>
            </div>

            <div className='playground-body'>

                <Editor 
                    value={editor_value}
                    errors={errors}
                    onChange={v => this.setState(this.compiled_state(v))}
                />
                <Tester
                    tests={tests}
                    setTests={e => this.setTests(e)}
                    grammar={this.state.compiled_grammar}
                    />
            </div>
        </div>
    }
}



ReactDOM.render(<Playground/>, document.getElementById('mount'))



