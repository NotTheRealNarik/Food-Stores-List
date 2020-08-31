import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete'

autocomplete($('#address'), $('#lat'), $('#lng')); //selecting the id's of teh fields given in _StoreForm.pug