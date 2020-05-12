import React, {useState} from 'react';
import {useQuery, useMutation} from "@apollo/react-hooks";
import {gql} from "apollo-boost";

/*
* TODO:
* Create an app that handle the todo's notes
* add, edit/modify, delete, display the list
* */

const GET_TODOS = gql`
    query getTodos {
        todos {
            id
            text
            done
        }
    }
`;

const TOGGLE_TODO = gql`
    mutation toggleTodo($id: uuid!, $done: Boolean) {
        update_todos(where: {id: {_eq: $id}}, _set: { done: $done }) {
            returning {
                done
                id
                text
            }
        }
    }
`;

const ADD_TODO = gql`
    mutation addTodo($text: String!) {
        insert_todos(objects: {text: $text}) {
            returning {
                done
                id
                text
            }
        }
    }
`;

const DELETE_TODO = gql`
    mutation deleteTodo($id: uuid!) {
        delete_todos(where: { id: {_eq: $id }}) {
            returning {
                done
                id
                text
            }
        }
    }
`;

function App() {
    const [todoText, setTodoText] = useState('');
    const {data, loading, error} = useQuery(GET_TODOS);
    const [toggleTodo] = useMutation(TOGGLE_TODO);
    const [addTodo] = useMutation(ADD_TODO, {
        onCompleted: () => setTodoText('')
    });

    const [deleteTodo] = useMutation(DELETE_TODO);


    if (loading) return <div>Loading todos...</div>;
    if (error) return <div>Error fetching todos</div>;

    async function handleToggleTodo({id, done}) {
        await toggleTodo({variables: {id, done: !done}});
    }

    async function handleAddTodo(e) {
        e.preventDefault();
        if (!todoText.trim()) return;
        await addTodo({
            variables: {text: todoText},
            refetchQueries: [
                {query: GET_TODOS}
            ]
        });
    }

    async function handleDeleteTodo({id}) {
        const isConfirmed = window.confirm('Are you sure to delete this?');
        if (isConfirmed) {
            await deleteTodo({
                variables: {id},
                update: cache => {
                    const prevData = cache.readQuery({query: GET_TODOS});
                    const newTodos = prevData.todos.filter(todo => todo.id !== id);
                    cache.writeQuery({query: GET_TODOS, data: {todos: newTodos}});
                }
            });
        }
    }

    return (
        <div className={"vh-100 code flex flex-column items-center bg-purple white pa3 fl-1"}>
            <h1 className={"f2-l"}>GraphQL Checklist <span role={"img"} aria-label={"checkmark"}>✔</span></h1>
            {/* TODO FORM */}
            <form onSubmit={handleAddTodo} className={"mb3"}>
                <input type="text"
                       className={"pa2 f4 b--dashed"}
                       onChange={e => setTodoText(e.target.value)}
                       placeholder={'Write your todo'}
                       value={todoText}/>
                <button type={'submit'} className={'pa2 f4 bg-green'}>Create</button>
            </form>
            {/* Todo List */}
            <div className={"flex items-center justify-center flex-column"}>
                {data.todos.map((todo) => (
                    <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
                        <span className={`pointer list pa1 f3 ${todo.done && 'strike'}`}>{todo.text}</span>
                        <button onClick={() => handleDeleteTodo(todo)} className={'bg-transparent nt bn f4'}>
                            <span className={'red'}>&times;</span>
                        </button>
                    </p>
                ))}
            </div>
        </div>
    );
}

export default App;
