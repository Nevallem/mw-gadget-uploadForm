/**
 * Upload form of ptwikipdia
 *
 * @author: [[pt:User:Danilo.mac]]
 * @author: Helder (https://github.com/he7d3r)
 * @author: [[pt:User:!Silent]]
 * @date: 14/abr/2010
 * @updated: 26/fev/2014
 */
/* jshint laxbreak: true, evil: true */
/* global mediaWiki, jQuery */

( function ( mw, $ ) {
'use strict';

mw.messages.set( {
	'uf-fillField': 'Existem campos obrigatórios que não foram preenchidos.'
} );

var uf = {};

/**
 * The fields of form
 *
 * @property: {desc: string, tip: string[, rows: number[, cols: number[, defaulText: string[, list: array[, optional: boolean[, condition: boolean]]]]]]}
 */
uf.fields = [ {
		rows: 3,
		cols: 80,
		desc: 'Descrição',
		tip: 'Descreva brevemente a imagem.'
	}, {
		rows: 2,
		cols: 80,
		desc: 'Fonte',
		tip: 'Qual é a fonte deste arquivo?'
	}, {
		rows: 2,
		cols: 80,
		desc: 'Autor',
		tip: 'Quem criou? Se mostra alguma obra artística, quem a criou?'
	}, {
		rows: 2,
		cols: 80,
		desc: 'Direitos',
		tip: 'Quem é o detentor dos direitos de autor?'
	}, {
		cols: 50,
		desc: 'Artigo',
		tip: 'Para qual artigo da Wikipédia essa imagem é necessária?'
	}, {
		cols: 50,
		desc: 'Integral ou parte',
		tip: 'Essa é a obra integral citada na fonte ou parte dela?'
	}, {
		desc: 'Tipo de carregamento',
		list: [ ' - ', [
			'1.1 - Pessoas e institucionais',
			'1.2 - Acontecimentos',
			'1.3 - Produtos',
			'1.4 - Logotipos, marcas, símbolos e cartazes',
			'1.5 - Ícones',
			'1.6 - Selos e moedas',
			'1.7 - Fauna e flora',
			'1.8 - Mapas',
			'1.9 - Material de divulgação',
			'1.10 - Capturas de ecrã ou telas e artes visuais',
			'1.11 - Personagens',
			'1.12 - Imagens microscópicas em geral',
			'2 - Som',
			'3 - Texto'
		] ],
		tip: 'Sob qual ponto da política de uso restrito este arquivo?'
	}, {
		rows: 2,
		cols: 60,
		desc: 'Propósito',
		tip: 'Qual é a importância para o artigo?',
		defaultText: 'Prover informação visual indispensável para a compreensão do artigo.'
	}, {
		rows: 2,
		cols: 60,
		desc: 'Insubstituível',
		tip: 'Por que não existe material semelhante sob licença livre? Você procurou? Onde?',
		defaultText: 'Não há versões da imagem sob licença livre.'
	}, {
		rows: 3,
		cols: 60,
		desc: 'Outras informações',
		tip: 'Se tiver alguma consideração adicional coloque aqui.',
		optional: true
	}, {
		cols: 20,
		desc: 'Permissão',
		tip: 'Insira a permissão correta',
		optional: true
	}, {
		desc: 'Licença',
		condition: $.inArray( mw.util.getParamValue( 'fonte' ), [ 'prop', 'flickr' ] ) !== -1,
		list: [ ' = ', [
			'não = ©Todos os direitos reservados',
			'cc-by-nd = Creative Commons Attribution No-Derivs',
			'cc-by-nc = Creative Commons Attribution Non-Commercial',
			'cc-by-nc-sa = Creative Commons Attribution Non-Commercial Share-Alike',
			'cc-by-nc-nd = Creative Commons Attribution Non-Commercial No-Derivs'
		] ],
		tip: 'Sob qual licença esse arquivo está sendo carregado?'
	}
];

/**
 * Creates the form
 */
uf.setupForm = function () {
	var i, j, currentField, listValues, tagName,
		$loading = $( '#mw-upload-form' ),
		$table = $( '#mw-htmlform-description tbody' );

	$( '.mw-htmlform-field-HTMLTextAreaField' ).remove();
	$( '.mw-htmlform-field-Licenses' ).remove();
	$( '#editpage-specialchars' ).parent().parent().parent().remove();

	$( '<input />', {
		'type': 'hidden',
		'name': 'wpUploadDescription',
		'id': 'wpUploadDescription'
	} ).appendTo( $table );

	$loading.submit( ( function ( oldSubmit ) {
		return function () {
			// First, let's construct the information template
			var doSubmit = uf.upload();

			// Then call whatever onsubmit hook already was present. If this is HotCat's submission
			// handler, it will add the categories to the 'wpUploadDescription' field.
			if ( doSubmit && oldSubmit ) {
				if ( typeof oldSubmit === 'string') {
					doSubmit = eval( oldSubmit );
				} else if ( typeof oldSubmit === 'function' ) {
					doSubmit = oldSubmit.apply( $loading[ 0 ], arguments );
				}
			}

			return doSubmit;
		};
	}( $loading[ 0 ].onsubmit ) ) );

	for ( i = 0; i < uf.fields.length; i++ ) {
		currentField = uf.fields[ i ];

		if ( currentField.condition !== undefined
			&& !currentField.condition
		) {
			continue;
		}

		if ( currentField.list ) {
			$( '<tr></tr>' ).append(
				$( '<td class="mw-label"></td>' ).append(
					$( '<label class="uf-label" for="uf-field-' + i + '"></label>' )
						.html( currentField.desc + ': ' )
				),
				$( '<td class="mw-input"></td>' ).append(
					$( '<select class="uf-field" id="uf-field-' + i + '"></select>' )
						.append( $( '<option></option>' ) )
				)
			).appendTo( $table );

			for ( j = 0; j < currentField.list[ 1 ].length; j++ ) {
				listValues = currentField.list[ 1 ][ j ].split( currentField.list[ 0 ] );

				$( '<option></option>' )
					.val( listValues[ 0 ] )
					.html( currentField.list[ 0 ] === ' - '
						? currentField.list[ 1 ][ j ]
						: listValues[ 1 ]
					).appendTo( $( '#uf-field-' + i  ) );
			}
		} else {
			tagName = ( !currentField.rows || currentField.rows === 1 ) ? 'input' : 'textarea';

			$( '<tr></tr>' ).append(
				$( '<td class="mw-label"></td>' ).append(
					$( '<label class="uf-label" for="uf-field-' + i + '"></label>' )
						.html( currentField.desc + ': ' )
				),
				$( '<td class="mw-input"></td>' ).append(
					$( '<' + tagName + '></' + tagName + '>' )
						.css( 'width', 'auto' )
						.attr( {
							'class': 'uf-field',
							'id': 'uf-field-' + i,
							'rows': currentField.rows || 1
						} ).attr( ( ( tagName === 'input' ) ? 'size' : 'cols' ), currentField.cols )
				)
			).appendTo( $table );

			if ( currentField.defaultText ) {
				$( '#uf-field-' + i ).val( currentField.defaultText );
			}
		}

		if ( currentField.tip ) {
			$( '#uf-field-' + i ).parent().append(
				$( '<div></div>' ).css( {
					'font-size': 'smaller',
					'minHeight': '25px'
				} )
			);
		}
	}
};

/**
 * Collect the image information e append in inpu#wpUploadDescription
 */
uf.upload = function () {
	var $this,
		text = '{' + '{Informação\n';

	$( '.uf-field' ).each( function ( i ) {
		$this = $( this );

		if ( !uf.fields[ i ].optional && $this.val() === '' ) {
			$this.addClass( 'uf-fill-field' );
		} else {
			$this.removeClass( 'uf-fill-field' );
		}

		text += '| '
			+ ( uf.fields[ i ]
				? uf.fields[ i ].desc
				: $( '.uf-label' ).eq( i ).html()
			).replace( /[\/():].*/g, '' ).toLowerCase()
			+ ' = '
			+ $this.val()
			+ '\n';
	} );

	if ( $( '.uf-field' ).hasClass( 'uf-fill-field' ) ) {
		alert( mw.message( 'uf-fillField' ).plain() );

		return false;
	}

	text += '}' + '}\n';

	$( '#wpUploadDescription' ).val( text );

	return true;
};

if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Upload'
	&& !mw.util.getParamValue( 'wpForReUpload' )
) {
	$( uf.setupForm );
}

}( mediaWiki, jQuery ) );
