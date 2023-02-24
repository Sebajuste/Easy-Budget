import React from "react";
import { Text, View } from "react-native";

export type ErrorBundaryState = {
    hasError: boolean;
    error?: any;
    errorInfo?: any;
};

export default class ErrorBundary extends React.Component<any, ErrorBundaryState> {

    constructor(props : any) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(error:any) {
        return { hasError: true, error: error };
    }

    componentDidCatch(error:any, errorInfo:any) {
        console.error('Error : ', error);
        console.error('Error info : ', JSON.stringify(errorInfo) );
    }

    render() {

        if (this.state.hasError) {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Oops, something went wrong.</Text>
                    { this.state.error ? (<Text>Error: {this.state.error.toString()}</Text>) : null }
                    { this.state.errorInfo ? (<Text>Error Info: {JSON.stringify(this.state.errorInfo.toString())}</Text>) : null }
                </View>
            );
        }
        return this.props.children; 
    }

}