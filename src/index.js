import React from 'react';
import {render} from 'react-dom';
import App from './App';
import ApolloClient from 'apollo-boost'
import {ApolloProvider} from '@apollo/react-hooks';

const client = new ApolloClient({
    uri: 'https://todos-graphql-v2.herokuapp.com/v1/graphql'
});



render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
    , document.getElementById('root'));
