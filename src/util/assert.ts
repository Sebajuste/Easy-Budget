

export default function assert( test : any, message?: string) {

    if( ! test ) {
        throw new Error(message ? message : '');
    }

}
